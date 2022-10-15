import { fabAuth, fabDb } from "@/firebase";
import { FabCollection } from "@/firebase/firebase-collections-enum";
import { userVmConverter } from "@/firebase/firebase-converters";
import { fabStor } from "@/firebase/index";
import type { UserVM } from "@/models/UserVM";
import type {
  UserStoreActions,
  UserStoreGetters,
  UserStoreState,
} from "@/types/user-store-types";
import type {
  UserVMEditAvatarFile,
  UserVmEditForInput,
  UserVMNewFormInput,
  UserVMRegWithEmailAndPassword,
  UserVMWithActivity,
} from "@/types/userVm-types";
import { findById } from "@/utils/array-helpers";
import { ok } from "@/utils/assert-helpers";
import { FirebaseSubscriptionManager } from "@/utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/utils/store-firebase-action-sinks";
import useAcceptHmr from "@/utils/store-helpers";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword as faBSingInWithEmailAndPassword,
  signInWithPopup,
  signOut as faBSignOut,
} from "@firebase/auth";
import {
  doc,
  FieldValue,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import type { Unsubscribe } from "@firebase/util";
import {
  getDownloadURL,
  ref as fabStoreRef,
  uploadBytes,
} from "firebase/storage";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { usePostStore } from "./post-store";
import { useThreadStore } from "./thread-store";

const { warn } = console;

export const useUserStore = defineStore(
  "user-store",
  (): UserStoreState & UserStoreGetters & UserStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;
    let _authObserverUnsubscribeFn: Unsubscribe | null = null;
    let _dbUnsubscribeAuthUser: Unsubscribe | null = null;

    const postStore = usePostStore();
    const threadStore = useThreadStore();

    const authUserId = ref<string | null>(null);
    const items = reactive<Array<UserVM>>([]);

    const getAuthUser = computed(() =>
      authUserId.value ? getUserByIdFn.value(authUserId.value) : undefined
    );

    const getUserByIdFn = computed(() => (id: string) => {
      const user = findById(items, id);

      if (!user) {
        warn(`Cannot get user by id "${id}".`);
        return;
      }

      const result: UserVMWithActivity = {
        ...user,

        get posts() {
          return postStore.items.filter(({ userId }) => userId === id);
        },

        get threads() {
          return threadStore.items.filter(({ userId }) => userId === id);
        },
      };

      return result;
    });

    async function forceInitFireBaseAuthState(): Promise<boolean> {
      _authObserverUnsubscribeFn?.();
      let isInForceEvent = true;

      return new Promise((resolve) => {
        _authObserverUnsubscribeFn = fabAuth.onIdTokenChanged((authUser) => {
          if (authUser) {
            fetchAuthUser().then((result) => {
              isInForceEvent && resolve(!!result);
              isInForceEvent = false;
            });
          } else {
            clearDbSubscriptionAuthUser();
            authUserId.value = null;
            isInForceEvent && resolve(false);
            isInForceEvent = false;
          }
        });
      });
    }

    async function signInWithEmailAndPassword(email: string, password: string) {
      await faBSingInWithEmailAndPassword(fabAuth, email, password);
    }

    async function signInWithGoogle() {
      const provider = new GoogleAuthProvider();

      const {
        user: { uid, ...rest },
      } = await signInWithPopup(fabAuth, provider);

      const userDoc = await getDoc(doc(fabDb, FabCollection.users, uid));

      if (!userDoc.exists()) {
        await createUser(uid, {
          email: rest.email ?? "",
          name: rest.displayName ?? "",
          username: rest.email ?? "",
          avatar: rest.photoURL ?? undefined,
        });
      }
    }

    async function signOut() {
      await faBSignOut(fabAuth);
    }

    async function registerUserWithEmailAndPassword({
      email,
      password,
      ...rest
    }: UserVMRegWithEmailAndPassword) {
      const {
        user: { uid },
      } = await createUserWithEmailAndPassword(fabAuth, email, password);

      return await createUser(uid, {
        email,
        ...rest,
      });
    }

    async function createUser(
      id: string,
      { email, avatar = null, avatarFile, ...rest }: UserVMNewFormInput
    ): Promise<string> {
      avatarFile && (avatar = await _uploadAvatar(avatarFile, id));

      const userDto: UserVMNewFormInput & {
        registeredAt: FieldValue;
      } & Pick<UserVM, "usernameLower" | "postsCount" | "threadsCount"> = {
        ...rest,
        email: email.toLowerCase(),
        avatar,
        usernameLower: rest.username.toLowerCase(),
        registeredAt: serverTimestamp(),
        postsCount: 0,
        threadsCount: 0,
      };

      await setDoc(_getRef(id), userDto);

      return id;
    }

    async function editUser(
      {
        id,
        avatarFile = undefined,
        email = "",
        name = "",
        username = "",
        avatar = null,
        bio = null,
        location = null,
        twitter = null,
        website = null,
      }: UserVmEditForInput,
      fetchAfter = false
    ) {
      avatarFile && (avatar = await _uploadAvatar(avatarFile, id));

      ok(
        email && name && username,
        "Edit user error: missing required filed values!"
      );

      const editDto = {
        id,
        name,
        email,
        username,
        avatar,
        bio,
        location,
        twitter,
        website,
      };

      const userRef = _getRef(id);

      await updateDoc(userRef, editDto);

      fetchAfter && (await fetchUser(id));
    }

    async function updateAvatar({
      id,
      avatarFile,
    }: UserVMEditAvatarFile): Promise<string> {
      ok(avatarFile, "Avatar file update error: no file data.");

      const avatar = await _uploadAvatar(avatarFile, id);

      const userRef = _getRef(id);

      await updateDoc(userRef, { avatar });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return avatar!;
    }

    const fetchUser = makeFirebaseFetchSingleDocFn(
      items,
      FabCollection.users,
      _dbUnsubscribes,
      userVmConverter
    );

    const fetchUsers = makeFirebaseFetchMultiDocsFn(
      items,
      FabCollection.users,
      _dbUnsubscribes,
      userVmConverter
    );

    async function fetchAuthUser() {
      const userId = fabAuth.currentUser?.uid;

      if (!userId) {
        return;
      }

      const customSink: Array<Unsubscribe> = [];

      const signedInUser = makeFirebaseFetchSingleDocFn(
        items,
        FabCollection.users,
        customSink,
        userVmConverter
      )(userId);

      if (!signedInUser) {
        warn(
          `User '${userId}' authenticated by Firestore do not exist in app's database.`
        );
        return;
      }

      _dbUnsubscribeAuthUser = customSink[0];

      authUserId.value = userId;

      return signedInUser;
    }

    function clearDbSubscriptionAuthUser() {
      _dbUnsubscribeAuthUser?.();
      _dbUnsubscribeAuthUser = null;
    }

    function _getRef(id: string) {
      return doc(fabDb, FabCollection.users, id);
    }

    async function _uploadAvatar(fileObj: File, uid: string): Promise<string> {
      const storeFileName = `uploads/${uid}/images/${fileObj.name}`;

      const storageRef = fabStoreRef(fabStor, storeFileName);

      const { ref } = await uploadBytes(storageRef, fileObj);

      return getDownloadURL(ref);
    }

    return {
      authUserId,
      items,
      getAuthUser,
      getUserByIdFn,
      forceInitFireBaseAuthState,
      signInWithEmailAndPassword,
      signInWithGoogle,
      signOut,
      registerUserWithEmailAndPassword,
      createUser,
      editUser,
      updateAvatar,
      fetchUser,
      fetchUsers,
      fetchAuthUser,
      clearDbSubscriptionAuthUser,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useUserStore);
