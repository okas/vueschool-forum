import type { PostVm } from "@/models/PostVm";
import type { Timestamp } from "firebase/firestore";

export type PostVMFormInput = Pick<PostVm, "text">;

export type PostVMNew = Pick<PostVm, "threadId"> & PostVMFormInput;

export type PostVMEdit = Pick<PostVm, "id"> & PostVMFormInput;

export type PostVmFireBase = Omit<PostVm, "publishedAt"> & {
  publishedAt: Timestamp;
};
