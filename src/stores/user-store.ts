import { fabAuth, fabStor } from "@/firebase";
import { FabCollection } from "@/firebase/firebase-collections-enum";
import { userVmConverter } from "@/firebase/firebase-converters";
import { getUserDocRef } from "@/firebase/firebase-get-refs";
import { FirebaseSubscriptionManager } from "@/firebase/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/firebase/store-firebase-action-sinks";
import type { UserVM } from "@/models/UserVM";
import type {
  UserStoreActions,
  UserStoreGetters,
  UserStoreState,
  UserVMCreateLoginStats,
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
import { nameUser } from "@/utils/model-member-name-helpers";
import useAcceptHmr from "@/utils/store-helpers";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword as faBSingInWithEmailAndPassword,
  signInWithPopup,
  signOut as faBSignOut,
  updateEmail as faBUpdateEmail,
  updatePassword as faBUpdatePassword,
  type UserMetadata,
} from "@firebase/auth";
import { getDoc, setDoc, updateDoc } from "@firebase/firestore";
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
      const {
        user: {
          uid,
          metadata: { lastSignInTime },
        },
      } = await faBSingInWithEmailAndPassword(fabAuth, email, password);

      if (!lastSignInTime) {
        warn(`Warning: user login metadata is missing, cannot set "lastlogin"`);
        return;
      }

      await updateDoc(getUserDocRef(uid), {
        [nameUser("lastVisitAt")]: new Date(lastSignInTime),
      });
    }

    async function signInWithGoogle() {
      const provider = getAppGoogleProvider();

      const {
        user: { uid, email, displayName, photoURL, metadata },
      } = await signInWithPopup(fabAuth, provider);

      const userDoc = await getDoc(getUserDocRef(uid));

      const loginStatsDto = _getLoginStats(metadata);

      if (!userDoc.exists()) {
        await createUser(
          uid,
          {
            email: email ?? "",
            name: displayName ?? "",
            username: email ?? "",
            avatar: photoURL ?? undefined,
          },
          loginStatsDto
        );
      }
    }

    async function signOut() {
      await faBSignOut(fabAuth);
    }

    async function reAuthenticate(
      email: string,
      password: string
    ): Promise<void> {
      const credential = EmailAuthProvider.credential(email, password);

      ok(
        fabAuth.currentUser,
        "Error re-authenticating: no authenticated user!"
      );

      await reauthenticateWithCredential(fabAuth.currentUser, credential);
    }

    async function registerUserWithEmailAndPassword({
      email,
      password,
      ...rest
    }: UserVMRegWithEmailAndPassword) {
      const {
        user: { uid, metadata },
      } = await createUserWithEmailAndPassword(fabAuth, email, password);

      const loginStatsDto = _getLoginStats(metadata);

      return await createUser(
        uid,
        {
          email,
          ...rest,
        },
        loginStatsDto
      );
    }

    async function createUser(
      id: string,
      { email, avatar = null, avatarFile, ...rest }: UserVMNewFormInput,
      loginStatsDto?: UserVMCreateLoginStats
    ): Promise<string> {
      avatarFile && (avatar = await _uploadAvatar(avatarFile, id));

      const userDto: UserVMNewFormInput &
        Pick<UserVM, "usernameLower" | "postsCount" | "threadsCount"> = {
        ...rest,
        email: email.toLowerCase(),
        avatar,
        usernameLower: rest.username.toLowerCase(),
        postsCount: 0,
        threadsCount: 0,
        ...loginStatsDto,
      };

      await setDoc(getUserDocRef(id), userDto);

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
      fetchAfter = false,
      password?: string
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

      await updateEmail(email);
      password && (await updatePassword(password));

      const userRef = getUserDocRef(id);

      await updateDoc(userRef, editDto);

      fetchAfter && (await fetchUser(id));
    }

    async function updateEmail(email: string): Promise<void> {
      ok(email, getBadCredentialErrorMsg("email"));
      ok(fabAuth.currentUser, getNoAuthUserErrorMsg("email"));

      return faBUpdateEmail(fabAuth.currentUser, email);
    }

    async function updatePassword(password: string): Promise<void> {
      ok(password, getBadCredentialErrorMsg("password"));
      ok(fabAuth.currentUser, getNoAuthUserErrorMsg("password"));

      return faBUpdatePassword(fabAuth.currentUser, password);
    }

    async function updateAvatar({
      id,
      avatarFile,
    }: UserVMEditAvatarFile): Promise<string> {
      ok(avatarFile, "Avatar file update error: no file data.");

      const avatar = await _uploadAvatar(avatarFile, id);

      const userRef = getUserDocRef(id);

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

    async function _uploadAvatar(fileObj: File, uid: string): Promise<string> {
      const storeFileName = `uploads/${uid}/images/${fileObj.name}`;

      const storageRef = fabStoreRef(fabStor, storeFileName);

      const { ref } = await uploadBytes(storageRef, fileObj);

      return getDownloadURL(ref);
    }

    function _getLoginStats({
      lastSignInTime,
      creationTime,
    }: UserMetadata): UserVMCreateLoginStats {
      return {
        lastVisitAt: lastSignInTime ? new Date(lastSignInTime) : undefined,
        registeredAt: creationTime ? new Date(creationTime) : undefined,
      };
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
      reAuthenticate,
      registerUserWithEmailAndPassword,
      createUser,
      editUser,
      updateEmail,
      updatePassword,
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

function getAppGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({
    prompt: "select_account",
  });

  return provider;
}

function getBadCredentialErrorMsg(credential: string): string {
  return `Error updating credential: no new ${credential} provided!`;
}

function getNoAuthUserErrorMsg(credential: string): string {
  return `Error updating ${credential}: no authenticated user!`;
}
