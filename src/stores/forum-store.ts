import { FabCollection } from "@/firebase/firebase-collections-enum";
import { hasIdVmConverter } from "@/firebase/firebase-converters";
import { FirebaseSubscriptionManager } from "@/firebase/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/firebase/store-firebase-action-sinks";
import type { ForumVM } from "@/models/ForumVM";
import type { ForumStoreActions } from "@/types/forum-store-types";
import type { StoreBaseState } from "@/types/store-base-types";
import useAcceptHmr from "@/utils/store-helpers";
import { defineStore } from "pinia";
import { reactive } from "vue";

export const useForumStore = defineStore(
  "forum-store",
  (): StoreBaseState<ForumVM> & ForumStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const items = reactive<Array<ForumVM>>([]);

    const fetchForum = makeFirebaseFetchSingleDocFn(
      items,
      FabCollection.forums,
      _dbUnsubscribes,
      hasIdVmConverter
    );

    const fetchForums = makeFirebaseFetchMultiDocsFn(
      items,
      FabCollection.forums,
      _dbUnsubscribes,
      hasIdVmConverter
    );

    return {
      items,
      fetchForum,
      fetchForums,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useForumStore);
