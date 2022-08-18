import { ok } from "assert";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { PostVMNew } from "../types/PostVMTypes";
import { StateMainStore } from "../types/StateMainStore";
import {
  ThreadVMEdit,
  ThreadVMNew,
  ThreadVMWithMeta,
} from "../types/ThreadVMTypes";
import { UserVMWithActivity } from "../types/UserVMTypes";
import { countBy, findById } from "../utils/array-helpers";
import { guidAsBase64 } from "../utils/misc";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";

const { warn } = console;

export const useMainStore = defineStore("main", (): StateMainStore => {
  // --------------------------
  //        STATE
  // --------------------------
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

  // --------------------------
  //        GETTERS
  // --------------------------

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

  // --------------------------
  //        ACTIONS
  // --------------------------

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

  const fetchThread = makeFirebaseFetchSingleDocFn(threads, "threads");

  const fetchUser = makeFirebaseFetchSingleDocFn(users, "users");

  const fetchPost = makeFirebaseFetchSingleDocFn(posts, "posts");

  const fetchForum = makeFirebaseFetchSingleDocFn(forums, "forums");

  const fetchCategory = makeFirebaseFetchSingleDocFn(categories, "categories");

  const fetchThreads = makeFirebaseFetchMultiDocsFn(threads, "threads");

  const fetchUsers = makeFirebaseFetchMultiDocsFn(users, "users");

  const fetchPosts = makeFirebaseFetchMultiDocsFn(posts, "posts");

  const fetchForums = makeFirebaseFetchMultiDocsFn(forums, "forums");

  function fetchAllCategories() {
    return makeFirebaseFetchMultiDocsFn(categories, "categories")();
  }

  // --------------------------
  //        __ INTERNALS __
  // --------------------------

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
    fetchForum,
    fetchCategory,
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
