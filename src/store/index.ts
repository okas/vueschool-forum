import { defineStore } from "pinia";
import { computed, ComputedRef, reactive, Ref, ref } from "vue";
import sourceData from "../data.json";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { guidAsBase64 } from "../utils/misc";

export interface StateMainStore {
  authId: Ref<string | undefined>;
  categories: CategoryVM[];
  forums: ForumVM[];
  posts: PostVm[];
  threads: ThreadVM[];
  users: UserVM[];
  stats: StatsVM;

  authUser: ComputedRef<UserVM | undefined>;
  getUserByIdFn: ComputedRef<(userId: string) => UserVM | undefined>;

  createPost(dto: Omit<PostVm, "id">): Promise<void>;
}

export const useMainStore = defineStore("main", (): StateMainStore => {
  const authId = ref("Qc4Pz_28PEqITnCQ21T6Vw");

  const categories = reactive(sourceData.categories);
  const forums = reactive(sourceData.forums);
  const posts = reactive(sourceData.posts);
  const threads = reactive(sourceData.threads);
  const users = reactive(sourceData.users);
  const stats = reactive(sourceData.stats);

  const authUser = computed(() => users.find(({ id }) => id === authId.value));

  const getUserByIdFn = computed(
    () => (userId: string) => users.find(({ id }) => id === userId)
  );

  async function createPost(dto: Omit<PostVm, "id">) {
    const id = guidAsBase64();

    posts.push({ id, ...dto });

    threads.find(({ id }) => id === dto.threadId)?.posts.push(id);
  }

  return {
    authId,
    categories,
    forums,
    posts,
    threads,
    users,
    stats,
    createPost,
    authUser,
    getUserByIdFn,
  };
});
