import { getStatsDocRef } from "@/firebase/firebase-get-refs";
import type { StatsVM } from "@/models/StatsVM";
import type {
  CommonStoreActions,
  CommonStoreState,
} from "@/types/common-store-types";
import useAcceptHmr from "@/utils/store-helpers";
import { onSnapshot } from "@firebase/firestore";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCommonStore = defineStore(
  "common-store",
  (): CommonStoreState & CommonStoreActions => {
    const isReady = ref(false);
    const isLoading = ref(true);

    const stats = ref<StatsVM | undefined>();

    function setReady(state = true) {
      isReady.value = state;
      isLoading.value = !state;
    }

    function setLoading(state = true) {
      isLoading.value = state;
    }

    onSnapshot(getStatsDocRef(), (docSnap) => {
      stats.value = docSnap.exists() ? (docSnap.data() as StatsVM) : undefined;
    });

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
