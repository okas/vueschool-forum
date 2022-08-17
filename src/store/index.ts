import { ok } from "assert";
import { defineStore } from "pinia";
import { computed, ComputedRef, reactive, Ref, ref } from "vue";
import sourceData from "../data.json";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { PostVMNew } from "../types/PostVMTypes";
import { ThreadVMEdit, ThreadVMNew } from "../types/ThreadVMTypes";
import { UserVMWithActivity } from "../types/UserVMTypes";
import { countBy, findById } from "../utils/array-helpers";
import { guidAsBase64 } from "../utils/misc";
import { ThreadVMWithMeta } from "./../types/ThreadVMTypes";

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
  getAuthUser: ComputedRef<UserVMWithActivity>;
  getUserByIdFn: ComputedRef<(userId: string) => UserVMWithActivity>;
  getUserPostsCountFn: ComputedRef<(userId: string) => number>;
  getUserThreadsCountFn: ComputedRef<(userId: string) => number>;
  getThreadMetaInfoFn: ComputedRef<(threadId: string) => ThreadVMWithMeta>;

  // ACTIONS
  editUser(dto: UserVM): Promise<void>;
  createPost(dto: PostVMNew): Promise<string>;
  createThread(dto: ThreadVMNew): Promise<string>;
  editThread(dto: ThreadVMEdit): Promise<void>;
}

export const useMainStore = defineStore("main", (): StateMainStore => {
  // STATE
  const authUserId = ref("Qc4Pz_28PEqITnCQ21T6Vw");

  const categories = reactive(sourceData.categories);
  const forums = reactive(sourceData.forums);
  const posts = reactive(sourceData.posts);
  const threads = reactive(sourceData.threads);
  const users = reactive(sourceData.users);
  const stats = reactive(sourceData.stats);

  // GETTERS
  const getAuthUser = computed(() => getUserByIdFn.value(authUserId.value));

  const getUserByIdFn = computed(() => (id: string) => {
    const user = findById(users, id);

    ok(user, `Cannot get user by id "${id}".`);

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

    // @ts-expect-error Emojis as keys in `.reactions`!
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
