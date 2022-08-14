import { ThreadVM } from "./../models/ThreadVM";
import { PostVMFormInput } from "./PostVMTypes";

export type ThreadVMFormInput = Pick<ThreadVM, "title"> & PostVMFormInput;

export type ThreadVMNew = Pick<ThreadVM, "forumId"> & ThreadVMFormInput;

export type ThreadVMEdit = Pick<ThreadVM, "id"> & ThreadVMFormInput;
