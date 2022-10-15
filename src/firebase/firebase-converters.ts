import type { FirestoreDataConverter } from "firebase/firestore";
import type { HasId } from "../models/HasId";
import type { PostVm } from "../models/PostVm";
import type { ThreadVM } from "../models/ThreadVM";
import type { UserVM } from "../models/UserVM";
import type { PostVmFireBase } from "../types/postVm-types";
import type { ThreadVmFireBase } from "../types/threadVm-types";
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
        ? {
            ...edited,
            at: tryGetSeconds(edited.at),
          }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasIdVmConverter: FirestoreDataConverter<HasId & any> = {
  toFirestore: (dto) => dto,
  fromFirestore: (snapShot) => {
    return {
      ...snapShot.data(),
      id: snapShot.id,
    };
  },
};
