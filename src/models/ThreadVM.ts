export class ThreadVM {
  id!: string;
  userId!: string;
  firstPostId!: string;
  forumId!: string;
  lastPostAt!: number;
  lastPostId!: string;
  publishedAt!: number;
  slug!: string;
  title!: string;
  contributors?: Array<string>;
  posts!: Array<string>;
}
