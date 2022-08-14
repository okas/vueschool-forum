import { defineStore } from "pinia";
import { computed, ComputedRef, reactive, Ref, ref } from "vue";
import sourceData from "../data.json";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { IAuthUser } from "../types/IAuthUser";
import { PostVMNew } from "../types/PostVMTypes";
import { ThreadVMNew } from "../types/ThreadVMTypes";
import { guidAsBase64 } from "../utils/misc";

export interface StateMainStore {
  // STATE
  authId: Ref<string | undefined>;
  categories: CategoryVM[];
  forums: ForumVM[];
  posts: PostVm[];
  threads: ThreadVM[];
  users: UserVM[];
  stats: StatsVM;

  // GETTERS
  authUser: ComputedRef<IAuthUser | undefined>;
  getUserByIdFn: ComputedRef<(userId: string) => UserVM | undefined>;
  getUserPostsCountFn: ComputedRef<(userId: string) => number>;
  getUserThreadsCountFn: ComputedRef<(userId: string) => number>;

  // ACTIONS
  editUser(dto: UserVM): Promise<void>;
  createPost(dto: PostVMNew): Promise<string>;
  createThread(dto: ThreadVMNew): Promise<string>;
}

export const useMainStore = defineStore("main", (): StateMainStore => {
  // STATE
  const authId = ref("Qc4Pz_28PEqITnCQ21T6Vw");

  const categories = reactive(sourceData.categories);
  const forums = reactive(sourceData.forums);
  const posts = reactive(sourceData.posts);
  const threads = reactive(sourceData.threads);
  const users = reactive(sourceData.users);
  const stats = reactive(sourceData.stats);

  // GETTERS
  const authUser = computed(() => {
    const user = users.find(({ id }) => id === authId.value);

    if (!user) {
      return undefined;
    }

    return {
      ...user,

      get posts() {
        return posts.filter(({ userId }) => userId === authId.value);
      },

      get threads() {
        return threads.filter(({ userId }) => userId === authId.value);
      },

      get postsCount() {
        return this.posts.length;
      },

      get threadsCount() {
        return this.threads.length;
      },
    } as IAuthUser;
  });

  const getUserByIdFn = computed(
    () => (userId: string) => users.find(({ id }) => id === userId)
  );

  const getUserPostsCountFn = computed(
    () => (id: string) =>
      posts.reduce((count, { userId }) => count + Number(userId === id), 0)
  );

  const getUserThreadsCountFn = computed(
    () => (id: string) =>
      threads.reduce((count, { userId }) => count + Number(userId === id), 0)
  );

  // ACTIONS
  async function editUser(dto: UserVM) {
    Object.assign(users[users.findIndex(({ id }) => id === dto.id)], dto);
  }

  async function createPost({ threadId, ...rest }: PostVMNew): Promise<string> {
    const id = guidAsBase64();
    const userId = authId.value;
    const publishedAt = Math.floor(Date.now() / 1000);

    const newPost = { threadId, id, userId, publishedAt, ...rest } as PostVm;

    posts.push(newPost);

    appendPostToThread(threadId, id);

    return id;
  }

  async function createThread({
    text,
    forumId,
    ...rest
  }: ThreadVMNew): Promise<string> {
    const id = guidAsBase64();
    const userId = authId.value;
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

    await createPost({
      text,
      threadId: id,
    });

    appendThreadToForum(forumId, id);

    return id;
  }

  // INTERNALS
  function appendPostToThread(threadId: string, postId: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const thread = threads.find(({ id }) => id === threadId)!;

    thread.posts ??= [];

    thread.posts.push(postId);
  }

  function appendThreadToForum(forumId: string, threadId: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const forum = forums.find(({ id }) => id === forumId)!;

    forum.threads ??= [];

    forum?.threads?.push(threadId);
  }

  return {
    // STATE
    authId,
    categories,
    forums,
    posts,
    threads,
    users,
    stats,
    authUser,
    // GETTERS
    getUserByIdFn,
    getUserPostsCountFn,
    getUserThreadsCountFn,
    // ACTIONS
    editUser,
    createPost,
    createThread,
  };
});
