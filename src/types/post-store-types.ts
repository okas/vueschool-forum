import { ComputedRef } from "vue";
import { PostVm } from "../models/PostVm";
import { PostVMEdit, PostVMNew } from "./postVm-types";
import { StoreBaseActions } from "./store-base-types";

export interface PostStoreGetters {
  getUserPostsCountFn: ComputedRef<(userId: string) => number>;
}

export interface PostStoreActions extends StoreBaseActions {
  createPost(dto: PostVMNew, threadCreation?: boolean): Promise<string>;
  editPost(dto: PostVMEdit, fetchAfter?: boolean): Promise<void>;
  fetchPost(id: string): Promise<PostVm | undefined>;
  fetchPosts(ids?: Array<string>): Promise<Array<PostVm>>;
  fetchAllUserPosts(limit: number, lastFetchedPostId?: string): Promise<void>;
}
