import { Timestamp } from "firebase/firestore";
import { PostVm } from "../models/PostVm";

export type PostVMFormInput = Pick<PostVm, "text">;

export type PostVMNew = Pick<PostVm, "threadId"> & PostVMFormInput;

export type PostVmFireBase = Omit<PostVm, "publishedAt"> & {
  publishedAt: Timestamp;
};
