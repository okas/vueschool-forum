import { HasId } from "./HasId";

export class UserVM extends HasId {
  name!: string;
  avatar?: string | null;
  email!: string;
  lastVisitAt!: number | Date;
  isModerator?: boolean;
  registeredAt!: number | Date;
  username!: string;
  usernameLower!: string;
  bio?: string | null;
  twitter?: string | null;
  website?: string | null;
  location?: string | null;
  postsCount!: number;
  threadsCount!: number;
}
