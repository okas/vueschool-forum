import { PostVm } from "../models/PostVm";

export type PostVMFormInput = Pick<PostVm, "text">;

export type PostVMNew = Pick<PostVm, "threadId"> & PostVMFormInput;
