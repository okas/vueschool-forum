import type { ForumVM } from "@/models/ForumVM";
import type { PostVm } from "@/models/PostVm";
import type { ThreadVM } from "@/models/ThreadVM";
import type { UserVM } from "@/models/UserVM";
import { nameofFactory } from "@/utils/nameof-helpers";
import type { StatsVM } from "../models/StatsVM";

export const nameStats = nameofFactory<StatsVM>();

export const nameUser = nameofFactory<UserVM>();

export const namePost = nameofFactory<PostVm>();

export const nameForum = nameofFactory<ForumVM>();

export const nameThread = nameofFactory<ThreadVM>();
