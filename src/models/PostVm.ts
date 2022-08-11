export class PostVm {
  id!: string;
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
