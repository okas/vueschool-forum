import type { StatsVM } from "@/models/StatsVM";
import type { Ref } from "vue";

export interface CommonStoreState {
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
  stats: Ref<StatsVM | undefined>;
}

export interface CommonStoreActions {
  setReady(state?: boolean): void;
  setLoading(state?: boolean): void;
}
