export class ForumVM {
  id!: string;
  name!: string;
  categoryId!: string;
  description!: string;
  lastPostId?: string;
  slug!: string;
  threads?: Array<string>;
}
