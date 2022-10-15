import type { StatsVM } from "@/models/StatsVM";
import type { Ref } from "vue";

export interface MainStoreState {
  stats: StatsVM;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
}

export interface MainStoreActions {
  setReady(state?: boolean): void;
  setLoading(state?: boolean): void;
}
