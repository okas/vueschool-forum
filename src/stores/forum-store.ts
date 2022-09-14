import { defineStore } from "pinia";
import { reactive } from "vue";
import { hasIdVmConverter } from "../firebase/firebase-converters";
import { ForumVM } from "../models/ForumVM";
import { ForumStoreActions, ForumStoreState } from "../types/forum-store-types";
import { FirebaseSubscriptionManager } from "../utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "../utils/store-firebase-action-sinks";
import useAcceptHmr from "../utils/store-helpers";

export const useForumStore = defineStore(
  "forum-store",
  (): ForumStoreState & ForumStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const forums = reactive<Array<ForumVM>>([]);

    const fetchForum = makeFirebaseFetchSingleDocFn(
      forums,
      "forums",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    const fetchForums = makeFirebaseFetchMultiDocsFn(
      forums,
      "forums",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    return {
      forums,
      fetchForum,
      fetchForums,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useForumStore);
