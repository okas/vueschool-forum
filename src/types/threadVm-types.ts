import { ThreadVM } from "../models/ThreadVM";
import { PostVMFormInput } from "./postVm-types";

export type ThreadVMFormInput = Pick<ThreadVM, "title"> & PostVMFormInput;

export type ThreadVMNew = Pick<ThreadVM, "forumId"> & ThreadVMFormInput;

export type ThreadVMEdit = Pick<ThreadVM, "id"> & ThreadVMFormInput;

export type ThreadVMWithMeta = ThreadVM & {
  authorName: string;
  repliesCount: number;
  contributorsCount: number;
};