import { HasId } from "../types/HasId";

export class UserVM extends HasId {
  name!: string;
  avatar!: string;
  email!: string;
  lastVisitAt!: number;
  isModerator?: boolean;
  registeredAt!: number;
  username!: string;
  usernameLower!: string;
  bio?: string;
  twitter?: string;
  website?: string;
  location?: string;
  postsCount!: number;
  threadsCount!: number;
}
