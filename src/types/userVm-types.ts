import { PostVm } from "../models/PostVm";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";

export type UserVMWithActivity = UserVM & {
  postsCount: number;
  threadsCount: number;
  posts: PostVm[];
  threads: ThreadVM[];
};
