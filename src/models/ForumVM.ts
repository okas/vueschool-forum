import { HasId } from "./HasId";

export class ForumVM extends HasId {
  name!: string;
  categoryId!: string;
  description!: string;
  lastPostId!: string;
  slug!: string;
  threads?: Array<string>;
}
