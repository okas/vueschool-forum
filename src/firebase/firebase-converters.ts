import { FirestoreDataConverter } from "firebase/firestore";
import { PostVm } from "../models/PostVm";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import { PostVmFireBase } from "../types/postVm-types";
import { ThreadVmFireBase } from "../types/threadVm-types";
import { tryGetSeconds } from "../utils/firebase-helpers";

export const postVmConverter: FirestoreDataConverter<PostVm> = {
  toFirestore: (dto) => dto,

  fromFirestore: (snapShot) => {
    const {
      publishedAt: publishedRaw,
      edited,
      ...rest
    } = snapShot.data() as PostVmFireBase;

    const publishedAt = tryGetSeconds(publishedRaw);

    const vm: PostVm = {
      ...rest,
      id: snapShot.id,
      publishedAt,
      edited: edited
        ? { ...edited, at: Math.floor(Date.now() / 1000) }
        : undefined,
    };

    return vm;
  },
};

export const threadVmConverter: FirestoreDataConverter<ThreadVM> = {
  toFirestore: (dto) => dto,

  fromFirestore: (snapShot) => {
    const {
      lastPostAt: lastRaw,
      publishedAt: publishedRaw,
      ...rest
    } = snapShot.data() as ThreadVmFireBase;

    const vm: ThreadVM = {
      ...rest,
      id: snapShot.id,
      lastPostAt: tryGetSeconds(lastRaw),
      publishedAt: tryGetSeconds(publishedRaw),
    };

    return vm;
  },
};

export const userVmConverter: FirestoreDataConverter<UserVM> = {
  toFirestore: (dto) => dto,

  fromFirestore: (snapShot) => {
    const {
      lastVisitAt: lastRaw,
      registeredAt: publishedRaw,
      ...rest
    } = snapShot.data() as UserVM;

    const vm: UserVM = {
      ...rest,
      id: snapShot.id,
      lastVisitAt: tryGetSeconds(lastRaw),
      registeredAt: tryGetSeconds(publishedRaw),
    };

    return vm;
  },
};
