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
  writeBatch,
} from "@firebase/firestore";
import { Unsubscribe } from "@firebase/util";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { fabAuth, fabDb } from "../firebase";
import { userVmConverter } from "../firebase/firebase-converters";
import { UserVM } from "../models/UserVM";
import {
  UserStoreActions,
  UserStoreGetters,
  UserStoreState,
} from "../types/user-store-types";
import {
  UserVmEditForInput,
  UserVMNewFormInput,
  UserVMRegWithEmailAndPassword,
  UserVMWithActivity,
} from "../types/userVm-types";
import { findById } from "../utils/array-helpers";
import { FirebaseSubscriptionManager } from "../utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "../utils/store-firebase-action-sinks";
import useAcceptHmr from "../utils/store-helpers";
import { usePostStore } from "./post-store";
import { useThreadStore } from "./threads-store";

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
    const users = reactive<Array<UserVM>>([]);

    const getAuthUser = computed(() =>
      authUserId.value ? getUserByIdFn.value(authUserId.value) : undefined
    );

    const getUserByIdFn = computed(() => (id: string) => {
      const user = findById(users, id);

      if (!user) {
        warn(`Cannot get user by id "${id}".`);
        return;
      }

      const result: UserVMWithActivity = {
        ...user,

        get posts() {
          return postStore.posts.filter(({ userId }) => userId === id);
        },

        get threads() {
          return threadStore.threads.filter(({ userId }) => userId === id);
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

      const userDoc = await getDoc(doc(fabDb, "users", uid));

      if (!userDoc.exists()) {
        await createUser(uid, {
          email: rest.email ?? "",
          name: rest.displayName ?? "",
          username: rest.email ?? "",
          avatar: rest.photoURL,
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
      { email, avatar = null, ...rest }: UserVMNewFormInput
    ): Promise<string> {
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

      await setDoc(doc(fabDb, "users", id), userDto);

      return id;
    }

    async function editUser(
      { id, ...rest }: UserVmEditForInput,
      fetchAfter = false
    ) {
      const editDto = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, v === undefined ? null : v])
      );

      const userRef = doc(fabDb, "users", id);

      await writeBatch(fabDb).update(userRef, editDto).commit();

      fetchAfter && (await fetchUser(id));
    }

    const fetchUser = makeFirebaseFetchSingleDocFn(
      users,
      "users",
      _dbUnsubscribes,
      userVmConverter
    );

    const fetchUsers = makeFirebaseFetchMultiDocsFn(
      users,
      "users",
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
        users,
        "users",
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

    return {
      authUserId,
      users,
      getAuthUser,
      getUserByIdFn,
      forceInitFireBaseAuthState,
      signInWithEmailAndPassword,
      signInWithGoogle,
      signOut,
      registerUserWithEmailAndPassword,
      createUser,
      editUser,
      fetchUser,
      fetchUsers,
      fetchAuthUser,
      clearDbSubscriptionAuthUser,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useUserStore);
