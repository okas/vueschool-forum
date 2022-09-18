import { defineStore } from "pinia";
import { reactive } from "vue";
import { hasIdVmConverter } from "../firebase/firebase-converters";
import { ForumVM } from "../models/ForumVM";
import { ForumStoreActions } from "../types/forum-store-types";
import { StoreBaseState } from "../types/store-base-types";
import { FirebaseSubscriptionManager } from "../utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "../utils/store-firebase-action-sinks";
import useAcceptHmr from "../utils/store-helpers";

export const useForumStore = defineStore(
  "forum-store",
  (): StoreBaseState<ForumVM> & ForumStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const items = reactive<Array<ForumVM>>([]);

    const fetchForum = makeFirebaseFetchSingleDocFn(
      items,
      "forums",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    const fetchForums = makeFirebaseFetchMultiDocsFn(
      items,
      "forums",
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
