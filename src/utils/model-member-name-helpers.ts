import type { ForumVM } from "@/models/ForumVM";
import type { PostVm } from "@/models/PostVm";
import type { ThreadVM } from "@/models/ThreadVM";
import type { UserVM } from "@/models/UserVM";
import { nameofFactory } from "@/utils/nameof-helpers";

export const nameUser = nameofFactory<UserVM>();

export const namePost = nameofFactory<PostVm>();

export const nameForum = nameofFactory<ForumVM>();

export const nameThread = nameofFactory<ThreadVM>();
