import { defineStore } from "pinia";
import { reactive } from "vue";
import { hasIdVmConverter } from "../firebase/firebase-converters";
import { ForumVM } from "../models/ForumVM";
import { ForumStoreActions, ForumStoreState } from "../types/forum-store-types";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";
import useAcceptHmr from "./helpers";
import { StoreBase } from "./store-base";

export const useForumStore = defineStore(
  "forum-store",
  (): ForumStoreState & ForumStoreActions => {
    const baseActions = new StoreBase();
    const { _dbUnsubscribes } = baseActions;

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
      clearDbSubscriptions: () => baseActions.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useForumStore);
