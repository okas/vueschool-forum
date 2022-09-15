import { ComputedRef } from "vue";
import { ThreadVM } from "../models/ThreadVM";
import { StoreBaseActions } from "./store-base-types";
import { ThreadVMEdit, ThreadVMNew, ThreadVMWithMeta } from "./threadVm-types";

export interface ThreadStoreState {
  threads: Array<ThreadVM>;
}

export interface ThreadStoreGetters {
  getThreadMetaInfoFn: ComputedRef<
    (threadId: string) => ThreadVMWithMeta | undefined
  >;
  getUserThreadsCountFn: ComputedRef<(userId: string) => number>;
}

export interface ThreadStoreActions extends StoreBaseActions {
  createThread(dto: ThreadVMNew): Promise<string>;
  editThread(dto: ThreadVMEdit): Promise<void>;
  fetchThread(id: string): Promise<ThreadVM | undefined>;
  fetchThreads(ids?: Array<string>): Promise<Array<ThreadVM>>;
  fetchThreadsByPage(
    page: number,
    pageSize: number,
    ids?: Array<string>
  ): Promise<Array<ThreadVM>>;
}
