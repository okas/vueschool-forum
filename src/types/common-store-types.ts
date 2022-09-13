import { Ref } from "vue";
import { StatsVM } from "../models/StatsVM";

export interface MainStoreState {
  stats: StatsVM;
  isReady: Ref<boolean>;
}
