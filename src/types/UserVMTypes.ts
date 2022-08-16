import { PostVm } from "../models/PostVm";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";

export type AuthUser = UserVM & {
  posts: PostVm[];
  threads: ThreadVM[];
  postsCount: number;
  threadsCount: number;
};
