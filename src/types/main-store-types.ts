import { ComputedRef, Ref } from "vue";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { PostVMEdit, PostVMNew } from "./postVm-types";
import { ThreadVMEdit, ThreadVMNew, ThreadVMWithMeta } from "./threadVm-types";
import { UserVMWithActivity } from "./userVm-types";

export interface MainStoreState {
  authUserId: Ref<string>;
  categories: Array<CategoryVM>;
  forums: Array<ForumVM>;
  posts: Array<PostVm>;
  threads: Array<ThreadVM>;
  users: Array<UserVM>;
  stats: StatsVM;
}

export interface MainStoreGetters {
  getAuthUser: ComputedRef<UserVMWithActivity | undefined>;
  getUserByIdFn: ComputedRef<(id: string) => UserVMWithActivity | undefined>;
  getUserPostsCountFn: ComputedRef<(userId: string) => number>;
  getUserThreadsCountFn: ComputedRef<(userId: string) => number>;
  getThreadMetaInfoFn: ComputedRef<
    (threadId: string) => ThreadVMWithMeta | undefined
  >;
  getCategoryNamedFn: ComputedRef<(categoryId: string) => string | undefined>;
}

export interface MainStoreActions {
  editUser(dto: UserVM): Promise<void>;
  createPost(dto: PostVMNew): Promise<string>;
  editPost(dto: PostVMEdit): Promise<void>;
  createThread(dto: ThreadVMNew): Promise<string>;
  editThread(dto: ThreadVMEdit): Promise<void>;
  fetchThread(id: string): Promise<ThreadVM | undefined>;
  fetchUser(id: string): Promise<UserVM | undefined>;
  fetchPost(id: string): Promise<PostVm | undefined>;
  fetchForum(id: string): Promise<ForumVM | undefined>;
  fetchCategory(id: string): Promise<CategoryVM | undefined>;
  fetchThreads(ids?: Array<string>): Promise<Array<ThreadVM>>;
  fetchUsers(ids?: Array<string>): Promise<Array<UserVM>>;
  fetchPosts(ids?: Array<string>): Promise<Array<PostVm>>;
  fetchForums(ids?: Array<string>): Promise<Array<ForumVM>>;
  fetchAllCategories(): Promise<Array<CategoryVM>>;
  fetchAuthUser(): Promise<UserVM | undefined>;
}
