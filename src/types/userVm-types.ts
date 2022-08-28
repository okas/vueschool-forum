import { Timestamp } from "@firebase/firestore";
import { PostVm } from "../models/PostVm";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";

export type UserVMWithActivity = UserVM & {
  posts: PostVm[];
  threads: ThreadVM[];
};

export type UserVMFireBase = Omit<UserVM, "lastVisitAt" | "registeredAt"> & {
  lastVisitAt: Timestamp;
  registeredAt: Timestamp;
};

export type UserVMNewFormInput = Pick<
  UserVM,
  "name" | "username" | "email" | "avatar"
>;

export type UserVmEditForInput = UserVMNewFormInput &
  Pick<UserVM, "id" | "bio" | "website" | "location" | "avatar" | "twitter">;
