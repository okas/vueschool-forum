import type { PostVm } from "@/models/PostVm";
import type { ThreadVM } from "@/models/ThreadVM";
import type { UserVM } from "@/models/UserVM";
import type { Timestamp } from "@firebase/firestore";

export type UserVMWithActivity = UserVM & {
  posts: PostVm[];
  threads: ThreadVM[];
};

export type UserVMFireBase = Omit<UserVM, "lastVisitAt" | "registeredAt"> & {
  lastVisitAt: Timestamp;
  registeredAt: Timestamp;
};

export type UserVMAvatarFile = { avatarFile?: File };

export type UserVMNewFormInput = UserVMAvatarFile &
  Pick<UserVM, "name" | "username" | "email" | "avatar">;

export type UserVmEditForInput = UserVMNewFormInput &
  Pick<UserVM, "id" | "bio" | "website" | "location" | "avatar" | "twitter">;

export type UserVMRegWithEmailAndPassword = UserVMNewFormInput & {
  password: string;
};

export type UserVMEditAvatarFile = UserVMAvatarFile & Pick<UserVM, "id">;
