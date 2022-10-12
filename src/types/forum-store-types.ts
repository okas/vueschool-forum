import type { ForumVM } from "../models/ForumVM";
import type { StoreBaseActions } from "./store-base-types";

export interface ForumStoreActions extends StoreBaseActions {
  fetchForum(id: string): Promise<ForumVM | undefined>;
  fetchForums(ids?: Array<string>): Promise<Array<ForumVM>>;
}
