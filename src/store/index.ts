import { defineStore } from "pinia";
import { reactive } from "vue";
import sourceData from "../data.json";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM, PostVm, ThreadVM } from "../models/ForumVM";
import { UserVM } from "../models/UserVM";

interface State {
  categories: CategoryVM[];
  forums: ForumVM[];
  posts: PostVm[];
  threads: ThreadVM[];
  users: UserVM[];
}

export const useMainStore = defineStore("root", (): State => {
  return { ...reactive(sourceData) };
});
