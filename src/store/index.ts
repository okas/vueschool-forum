import { ok } from "assert";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  Query,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { defineStore } from "pinia";
import { computed, ComputedRef, reactive, Ref, ref } from "vue";
import firebaseConfig from "../config/firebase.js";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { HasId } from "../types/HasId";
import { PostVMNew } from "../types/PostVMTypes";
import { ThreadVMEdit, ThreadVMNew } from "../types/ThreadVMTypes";
import { UserVMWithActivity } from "../types/UserVMTypes";
import { countBy, findById, toBuckets } from "../utils/array-helpers";
import { guidAsBase64 } from "../utils/misc";
import { _isFulFilled } from "../utils/promise-helpers";
import { ThreadVMWithMeta } from "./../types/ThreadVMTypes";

const { warn } = console;
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

export interface StateMainStore {
  // STATE
  authUserId: Ref<string | undefined>;
  categories: Array<CategoryVM>;
  forums: Array<ForumVM>;
  posts: Array<PostVm>;
  threads: Array<ThreadVM>;
  users: Array<UserVM>;
  stats: StatsVM;

  // GETTERS
  getAuthUser: ComputedRef<UserVMWithActivity | undefined>;
  getUserByIdFn: ComputedRef<
    (userId: string) => UserVMWithActivity | undefined
  >;
  getUserPostsCountFn: ComputedRef<(userId: string) => number>;
  getUserThreadsCountFn: ComputedRef<(userId: string) => number>;
  getThreadMetaInfoFn: ComputedRef<(threadId: string) => ThreadVMWithMeta>;

  // ACTIONS
  editUser(dto: UserVM): Promise<void>;
  createPost(dto: PostVMNew): Promise<string>;
  createThread(dto: ThreadVMNew): Promise<string>;
  editThread(dto: ThreadVMEdit): Promise<void>;
  fetchThread(id: string): Promise<ThreadVM | undefined>;
  fetchUser(id: string): Promise<UserVM | undefined>;
  fetchPost(id: string): Promise<PostVm | undefined>;
  fetchThreads(ids?: Array<string>): Promise<Array<ThreadVM>>;
  fetchUsers(ids?: Array<string>): Promise<Array<UserVM>>;
  fetchPosts(ids?: Array<string>): Promise<Array<PostVm>>;
  fetchForums(ids?: Array<string>): Promise<Array<ForumVM>>;
  fetchAllCategories(): Promise<Array<CategoryVM>>;
}

export const useMainStore = defineStore("main", (): StateMainStore => {
  // STATE
  const authUserId = ref("Qc4Pz_28PEqITnCQ21T6Vw");

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

  // GETTERS
  const getAuthUser = computed(() => getUserByIdFn.value(authUserId.value));

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

      get postsCount() {
        return this.posts?.length ?? 0;
      },

      get threadsCount() {
        return this.threads.length ?? 0;
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

  // ACTIONS
  async function editUser(dto: UserVM) {
    Object.assign(users[users.findIndex(({ id }) => id === dto.id)], dto);
  }

  async function createPost({ threadId, ...rest }: PostVMNew): Promise<string> {
    const id = guidAsBase64();
    const userId = authUserId.value;
    const publishedAt = Math.floor(Date.now() / 1000);

    const newPost: PostVm = { ...rest, threadId, id, userId, publishedAt };

    posts.push(newPost);

    tryAppendPostToThreadOrThrow(threadId, id);
    tryAppendContributorToThreadOrThrow(threadId, userId);

    return id;
  }

  async function createThread({
    text,
    forumId,
    ...rest
  }: ThreadVMNew): Promise<string> {
    const id = guidAsBase64();
    const userId = authUserId.value;
    const publishedAt = Math.floor(Date.now() / 1000);
    const posts: string[] = [];

    const newThread = {
      ...rest,
      forumId,
      id,
      userId,
      publishedAt,
      posts,
    } as ThreadVM;

    threads.push(newThread);

    await createPost({ text, threadId: id });

    tryAppendThreadToForumOrThrow(forumId, id);

    return id;
  }

  async function editThread({ id: threadId, title, text }: ThreadVMEdit) {
    const thread = findById(threads, threadId);
    ok(thread, `Edit thread error: no thread with id: "${threadId}".`);

    const post = findById(posts, thread.posts[0]);
    ok(post, `Edit thread error: no post with id: ${thread.posts[0]}.`);

    thread.title = title;
    post.text = text;
  }

  const fetchThread = _makeFirebaseFetchDocFn(threads, "threads");

  const fetchUser = _makeFirebaseFetchDocFn(users, "users");

  const fetchPost = _makeFirebaseFetchDocFn(posts, "posts");

  const fetchThreads = _makeFirebaseFetchDocsFn(threads, "threads");

  const fetchUsers = _makeFirebaseFetchDocsFn(users, "users");

  const fetchPosts = _makeFirebaseFetchDocsFn(posts, "posts");

  const fetchForums = _makeFirebaseFetchDocsFn(forums, "forums");

  function fetchAllCategories() {
    return _makeFirebaseFetchDocsFn(categories, "categories")();
  }

  // INTERNALS

  const tryAppendPostToThreadOrThrow = _makeParentChildUniqueAppenderFn(
    threads,
    "posts"
  );

  const tryAppendThreadToForumOrThrow = _makeParentChildUniqueAppenderFn(
    forums,
    "threads"
  );

  const tryAppendContributorToThreadOrThrow = _makeParentChildUniqueAppenderFn(
    threads,
    "contributors"
  );

  return {
    // STATE
    authUserId,
    categories,
    forums,
    posts,
    threads,
    users,
    stats,
    // GETTERS
    getAuthUser,
    getUserByIdFn,
    getUserPostsCountFn,
    getUserThreadsCountFn,
    getThreadMetaInfoFn,
    // ACTIONS
    editUser,
    createPost,
    createThread,
    editThread,
    fetchThread,
    fetchUser,
    fetchPost,
    fetchThreads,
    fetchUsers,
    fetchPosts,
    fetchForums,
    fetchAllCategories,
  };
});

function _makeParentChildUniqueAppenderFn<
  TId,
  TParent extends { id: TId } & Record<string, unknown>,
  PropChild extends keyof TParent
>(array: Array<TParent>, childArrayProp: PropChild) {
  return <TAppendValue>(parentId: TId, appendValue: TAppendValue) => {
    const parent = findById(array, parentId);

    ok(parent, `Append error: non-existing parent.`);

    const childArray = parent[childArrayProp] as Array<TAppendValue>;

    if (!childArray) {
      (parent[childArrayProp] as Array<TAppendValue>) = [appendValue];
    } else if (!childArray.includes(appendValue)) {
      childArray.push(appendValue);
    }
  };
}

function _makeFirebaseFetchDocFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string
): (id: string) => Promise<TViewModel | undefined> {
  return async (id: string) => {
    const docSnap = await getDoc(doc(firestoreDb, collectionName, id));

    if (!docSnap.exists()) {
      _warn(collectionName, id);
      return;
    }

    const viewModel = _vmMapper<TViewModel>(docSnap);

    array.push(viewModel);

    return viewModel;
  };
}

function _makeFirebaseFetchDocsFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string
): (ids?: Array<string>) => Promise<Array<TViewModel>> {
  return async (ids?: Array<string>) => {
    const queries = _getQueries(collectionName, ids);

    const settledPromises = await Promise.allSettled(queries.map(getDocs));

    const querySnaps: QuerySnapshot<DocumentData>[] = [];

    settledPromises.forEach((x) => _isFulFilled(x) && querySnaps.push(x.value));

    const viewModels = querySnaps.flatMap((qs) =>
      qs.docs.map((doc) => _vmMapper<TViewModel>(doc))
    );

    if (!viewModels.length) {
      _warn(collectionName, ...(ids ?? []));
    } else {
      array.push(...viewModels);
    }

    return viewModels;
  };
}

function _getQueries(
  collectionName: string,
  ids?: string[]
): Array<Query<DocumentData>> {
  if (!ids?.length) {
    return [query(collection(firestoreDb, collectionName))];
  }

  return _createBucketedQueries(ids, collectionName);
}

function _createBucketedQueries(
  ids: string[],
  collectionName: string
): Array<Query<DocumentData>> {
  const queries: Query<DocumentData>[] = [];

  for (const bucket of toBuckets(ids, 10)) {
    queries.push(
      query(
        collection(firestoreDb, collectionName),
        where(documentId(), "in", bucket)
      )
    );
  }

  return queries;
}

function _warn(collectionName: string, ...ids: string[]) {
  warn(
    `Fetch documents warning: no documents in collection "${collectionName}" with id(s) "${ids}"!`
  );
}

function _vmMapper<TViewModel extends HasId>(
  snap: QueryDocumentSnapshot<DocumentData>
): TViewModel {
  return { ...snap.data(), id: snap.id } as TViewModel;
}
