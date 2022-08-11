import { defineStore } from "pinia";
import { reactive } from "vue";
import sourceData from "../data.json";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { guidAsBase64 } from "../utils/misc";

export interface StateMainStore {
  categories: CategoryVM[];
  forums: ForumVM[];
  posts: PostVm[];
  threads: ThreadVM[];
  users: UserVM[];
  stats: StatsVM;

  createPost(dto: Omit<PostVm, "id">): Promise<void>;
}

export const useMainStore = defineStore("main", (): StateMainStore => {
  const categories = reactive(sourceData.categories);
  const forums = reactive(sourceData.forums);
  const posts = reactive(sourceData.posts);
  const threads = reactive(sourceData.threads);
  const users = reactive(sourceData.users);
  const stats = reactive(sourceData.stats);

  async function createPost(dto: Omit<PostVm, "id">) {
    const id = guidAsBase64();

    posts.push({ id, ...dto });

    threads.find(({ id }) => id === dto.threadId)?.posts.push(id);
  }

  return { categories, forums, posts, threads, users, stats, createPost };
});
