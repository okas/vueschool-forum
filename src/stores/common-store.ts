import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { StatsVM } from "../models/StatsVM";
import { MainStoreState } from "../types/common-store-types";
import useAcceptHmr from "./helpers";

export const useCommonStore = defineStore(
  "common-store",
  (): MainStoreState => {
    const stats = reactive<StatsVM>({
      postsCount: 0,
      threadsCount: 0,
      usersCount: 0,
      usersOnline: 0,
    });
    const isReady = ref(false);

    return {
      stats,
      isReady,
    };
  }
);

useAcceptHmr(useCommonStore);
