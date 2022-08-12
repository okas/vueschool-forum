import { PostVm } from "../models/PostVm";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";

export interface IAuthUser extends UserVM {
  posts: PostVm[];
  threads: ThreadVM[];
  postsCount: number;
  threadsCount: number;
}
