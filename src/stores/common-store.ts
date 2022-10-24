import { getStatsDocRef } from "@/firebase/firebase-get-refs";
import type { StatsVM } from "@/models/StatsVM";
import type {
  CommonStoreActions,
  CommonStoreState,
} from "@/types/common-store-types";
import useAcceptHmr from "@/utils/store-helpers";
import { onSnapshot } from "@firebase/firestore";
import { computedAsync } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCommonStore = defineStore(
  "common-store",
  (): CommonStoreState & CommonStoreActions => {
    const isReady = ref(false);
    const isLoading = ref(true);

    const _stats = ref<StatsVM | undefined>();

    const stats = computedAsync(async () => {
      onSnapshot(getStatsDocRef(), (docSnap) => {
        _stats.value = docSnap.exists()
          ? (docSnap.data() as StatsVM)
          : undefined;
      });

      return _stats.value;
    });

    function setReady(state = true) {
      isReady.value = state;
      isLoading.value = !state;
    }

    function setLoading(state = true) {
      isLoading.value = state;
    }

    return {
      isReady,
      isLoading,
      stats,
      setReady,
      setLoading,
    };
  }
);

useAcceptHmr(useCommonStore);
