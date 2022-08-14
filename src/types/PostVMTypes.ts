import { PostVm } from "../models/PostVm";

export type PostVMNew = Omit<PostVm, "id" | "userId" | "publishedAt">;

export type PostVMFormInput = Pick<PostVm, "text">;
