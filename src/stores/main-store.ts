import { ok } from "assert";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword as faBSingInWithEmailAndPassword,
  signInWithPopup,
  signOut as faBSignOut,
} from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  FieldValue,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  writeBatch,
} from "firebase/firestore";

import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import {
  postVmConverter,
  threadVmConverter,
  userVmConverter,
} from "../firebase/firebase-converters";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import {
  MainStoreActions,
  MainStoreGetters,
  MainStoreState,
} from "../types/main-store-types";
import { PostVMEdit, PostVMNew } from "../types/postVm-types";
import {
  ThreadVMEdit,
  ThreadVMNew,
  ThreadVMWithMeta,
} from "../types/threadVm-types";
import {
  UserVmEditForInput,
  UserVMNewFormInput,
  UserVMRegWithEmailAndPassword,
  UserVMWithActivity,
} from "../types/userVm-types";
import { countBy, findById } from "../utils/array-helpers";
import { hasIdVmConverter } from "./../firebase/firebase-converters";
import { fabAuth, fabDb } from "./../firebase/index";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";

const { warn } = console;

export const useMainStore = defineStore(
  "main",
  (): MainStoreState & MainStoreGetters & MainStoreActions => {
    // --------------------------
    //        STATE
    // --------------------------
    const authUserId = ref<string | null>(null);

    const categories = reactive<Array<CategoryVM>>([]);
    const forums = reactive<Array<ForumVM>>([]);
    const posts = reactive<Array<PostVm>>([]);
    const threads = reactive<Array<ThreadVM>>([]);
    const users = reactive<Array<UserVM>>([]);
    const stats = reactive<StatsVM>({
      postsCount: 0,
      threadsCount: 0,
      usersCount: 0,
      usersOnline: 0,
    });
    const _dbUnsubscribes = reactive<Array<Unsubscribe>>([]);
    const _dbUnsubscribeAuthUser = ref<Unsubscribe | null>(null);
    const _isReady = ref(false);

    // --------------------------
    //        GETTERS
    // --------------------------

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
          return posts.filter(({ userId }) => userId === id);
        },

        get threads() {
          return threads.filter(({ userId }) => userId === id);
        },
      };

      return result;
    });

    const getUserPostsCountFn = computed(
      () => (id: string) => countBy(posts, ({ userId }) => userId === id)
    );

    const getUserThreadsCountFn = computed(
      () => (id: string) => countBy(threads, ({ userId }) => userId === id)
    );

    const getThreadMetaInfoFn = computed(() => (threadId: string) => {
      const thread = findById(threads, threadId);
      ok(thread, `No thread with id: "${threadId}".`);

      const result: ThreadVMWithMeta = {
        ...thread,

        get authorName() {
          return findById(users, thread.userId)?.name ?? "<missing>";
        },

        get repliesCount() {
          return thread.posts.length - 1;
        },

        get contributorsCount() {
          return new Set(thread.contributors).size;
        },
      };

      return result;
    });

    const getCategoryNamedFn = computed(
      () => (categoryId: string) => findById(categories, categoryId)?.name
    );

    // --------------------------
    //        ACTIONS
    // --------------------------

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

      return await createUser(uid, { email, ...rest });
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

    async function createPost(
      { threadId, ...rest }: PostVMNew,
      threadCreation = false
    ): Promise<string> {
      ok(authUserId.value, CREATE_CONTENT_ERROR_MSG);

      const postDto: Omit<PostVm, "id" | "publishedAt"> & {
        publishedAt: FieldValue;
      } = {
        ...rest,
        threadId,
        userId: authUserId.value,
        publishedAt: serverTimestamp(),
      };

      const thread = findById(threads, threadId);

      ok(thread, `Cannot get thread by id "${threadId}".`);

      const postRef = doc(collection(fabDb, "posts"));
      const threadRef = doc(fabDb, "threads", threadId);
      const forumRef = doc(fabDb, "forums", thread.forumId);
      const userRef = doc(fabDb, "users", authUserId.value);

      await writeBatch(fabDb)
        .set(postRef, postDto)
        .update(threadRef, {
          posts: arrayUnion(postRef.id),
          lastPostAt: serverTimestamp(),
          contributors: arrayUnion(authUserId.value),
          lastPostId: postRef.id,
          ...(threadCreation && { firstPostId: postRef.id }),
        })
        .update(forumRef, { lastPostId: postRef.id })
        .update(userRef, { postsCount: increment(1) })
        .commit();

      await Promise.allSettled([
        fetchPost(postRef.id),
        fetchThread(threadId),
        fetchForum(forumRef.id),
        fetchUser(authUserId.value),
      ]);

      return postRef.id;
    }

    async function editPost({ id, text }: PostVMEdit) {
      const postRef = doc(fabDb, "posts", id);

      await writeBatch(fabDb)
        .update(postRef, {
          text,
          edited: {
            at: serverTimestamp(),
            by: authUserId.value,
            moderated: false,
          },
        })
        .commit();

      await fetchPost(id);
    }

    async function createThread({
      text,
      forumId,
      ...rest
    }: ThreadVMNew): Promise<string> {
      ok(authUserId.value, CREATE_CONTENT_ERROR_MSG);

      const threadDto: Omit<
        ThreadVM,
        "id" | "publishedAt" | "lastPostAt" | "firstPostId" | "lastPostId"
      > & {
        publishedAt: FieldValue;
        lastPostAt: FieldValue;
      } = {
        ...rest,
        forumId,
        userId: authUserId.value,
        publishedAt: serverTimestamp(),
        lastPostAt: serverTimestamp(),
        posts: [],
        contributors: [authUserId.value],
        slug: "",
      };

      const threadRef = doc(collection(fabDb, "threads"));
      const forumRef = doc(fabDb, "forums", forumId);
      const userRef = doc(fabDb, "users", authUserId.value);

      await writeBatch(fabDb)
        .set(threadRef, threadDto)
        .update(forumRef, { threads: arrayUnion(threadRef.id) })
        .update(userRef, { threadsCount: increment(1) })
        .commit();

      // Guarantees, that next step, createPost has required data for it's job.
      await fetchThread(threadRef.id);

      // As `createPost` already fetches graph, there is no need to fetch
      // anymore nor update store manually.
      await createPost({ text, threadId: threadRef.id }, true);

      return threadRef.id;
    }

    async function editThread({ id: threadId, title, text }: ThreadVMEdit) {
      const thread = findById(threads, threadId);
      ok(thread, `Edit thread error: no thread with id: "${threadId}".`);
      ok(
        thread.firstPostId,
        `Edit thread error: thread: "${threadId}" is missing "firstPostId".`
      );

      const post = findById(posts, thread.firstPostId);
      ok(post, `Edit thread error: no post with id: ${thread.firstPostId}.`);

      const postRef = doc(fabDb, "posts", thread.firstPostId);
      const threadRef = doc(fabDb, "threads", threadId);

      await writeBatch(fabDb)
        .update(threadRef, { title })
        .update(postRef, {
          text,
          edited: {
            at: serverTimestamp(),
            by: authUserId.value,
            moderated: false,
          },
        })
        .commit();

      await Promise.allSettled([
        fetchThread(threadId),
        fetchPost(thread.firstPostId),
      ]);
    }

    const fetchThread = makeFirebaseFetchSingleDocFn(
      threads,
      "threads",
      _dbUnsubscribes,
      threadVmConverter
    );

    const fetchUser = makeFirebaseFetchSingleDocFn(
      users,
      "users",
      _dbUnsubscribes,
      userVmConverter
    );

    const fetchPost = makeFirebaseFetchSingleDocFn(
      posts,
      "posts",
      _dbUnsubscribes,
      postVmConverter
    );

    const fetchForum = makeFirebaseFetchSingleDocFn(
      forums,
      "forums",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    const fetchCategory = makeFirebaseFetchSingleDocFn(
      categories,
      "categories",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    const fetchThreads = makeFirebaseFetchMultiDocsFn(
      threads,
      "threads",
      _dbUnsubscribes,
      threadVmConverter
    );

    const fetchUsers = makeFirebaseFetchMultiDocsFn(
      users,
      "users",
      _dbUnsubscribes,
      userVmConverter
    );

    const fetchPosts = makeFirebaseFetchMultiDocsFn(
      posts,
      "posts",
      _dbUnsubscribes,
      postVmConverter
    );

    const fetchForums = makeFirebaseFetchMultiDocsFn(
      forums,
      "forums",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    function fetchAllCategories() {
      return makeFirebaseFetchMultiDocsFn(
        categories,
        "categories",
        _dbUnsubscribes,
        hasIdVmConverter
      )();
    }

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

      _dbUnsubscribeAuthUser.value = customSink[0];

      authUserId.value = userId;

      return signedInUser;
    }

    function clearDbSubscriptions() {
      _dbUnsubscribes.forEach((unsubscribe) => unsubscribe());
      _dbUnsubscribes.splice(0);
    }

    function clearDbSubscriptionAuthUser() {
      _dbUnsubscribeAuthUser.value?.();
      _dbUnsubscribeAuthUser.value = null;
    }

    return {
      // STATE

      authUserId,
      categories,
      forums,
      posts,
      threads,
      users,
      stats,
      _dbUnsubscribes,
      _dbUnsubscribeAuthUser,
      _isReady,

      // GETTERS

      signInWithEmailAndPassword,
      signInWithGoogle,
      signOut,
      getAuthUser,
      getUserByIdFn,
      getUserPostsCountFn,
      getUserThreadsCountFn,
      getThreadMetaInfoFn,
      getCategoryNamedFn,

      // ACTIONS

      registerUserWithEmailAndPassword,
      createUser,
      editUser,
      createPost,
      editPost,
      createThread,
      editThread,
      fetchThread,
      fetchUser,
      fetchPost,
      fetchForum,
      fetchCategory,
      fetchThreads,
      fetchUsers,
      fetchPosts,
      fetchForums,
      fetchAllCategories,
      fetchAuthUser,
      clearDbSubscriptions,
      clearDbSubscriptionAuthUser,
    };
  }
);

const CREATE_CONTENT_ERROR_MSG =
  "Create post error: cannot proceed w/o authenticated user.";
