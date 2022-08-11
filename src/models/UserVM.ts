export class UserVM {
  id!: string;
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
}
