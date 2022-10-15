import { HasId } from "./HasId";

export class PostVm extends HasId {
  userId!: string;
  publishedAt!: number;
  text!: string;
  threadId!: string;
  edited?: {
    at: number;
    by: string;
    moderated: boolean;
  } | null;

  reactions?: {
    [key: string]: unknown;
  } | null;
}
