import type { ThreadVM } from "@/models/ThreadVM";
import type { Timestamp } from "firebase/firestore";
import type { PostVMFormInput } from "./postVm-types";

export type ThreadVMFormInput = Pick<ThreadVM, "title"> & PostVMFormInput;

export type ThreadVMNew = Pick<ThreadVM, "forumId"> & ThreadVMFormInput;

export type ThreadVMEdit = Pick<ThreadVM, "id"> & ThreadVMFormInput;

export type ThreadVMWithMeta = ThreadVM & {
  authorName: string;
  repliesCount: number;
  contributorsCount: number;
};

export type ThreadVmFireBase = Omit<ThreadVM, "lastPostAt" | "publishedAt"> & {
  lastPostAt: Timestamp;
  publishedAt: Timestamp;
};
