import { HasId } from "./HasId";

export class UserVM extends HasId {
  name!: string;
  avatar?: string | null;
  email!: string;
  lastVisitAt!: number;
  isModerator?: boolean;
  registeredAt!: number;
  username!: string;
  usernameLower!: string;
  bio?: string | null;
  twitter?: string | null;
  website?: string | null;
  location?: string | null;
  postsCount!: number;
  threadsCount!: number;
}
