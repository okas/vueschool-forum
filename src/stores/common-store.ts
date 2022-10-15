import type { StatsVM } from "@/models/StatsVM";
import type {
  MainStoreActions,
  MainStoreState,
} from "@/types/common-store-types";
import useAcceptHmr from "@/utils/store-helpers";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useCommonStore = defineStore(
  "common-store",
  (): MainStoreState & MainStoreActions => {
    const stats = reactive<StatsVM>({
      postsCount: 0,
      threadsCount: 0,
      usersCount: 0,
      usersOnline: 0,
    });
    const isReady = ref(false);
    const isLoading = ref(true);

    function setReady(state = true) {
      isReady.value = state;
      isLoading.value = !state;
    }

    function setLoading(state = true) {
      isLoading.value = state;
    }

    return {
      stats,
      isReady,
      isLoading,
      setReady,
      setLoading,
    };
  }
);

useAcceptHmr(useCommonStore);
