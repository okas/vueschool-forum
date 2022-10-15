import type { Ref } from "vue";
import type { StatsVM } from "../models/StatsVM";

export interface MainStoreState {
  stats: StatsVM;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
}

export interface MainStoreActions {
  setReady(state?: boolean): void;
  setLoading(state?: boolean): void;
}
