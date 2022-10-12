import type { ComputedRef } from "vue";
import type { CategoryVM } from "./../models/CategoryVM";
import type { StoreBaseActions } from "./store-base-types";

export interface CategoryStoreState {
  items: Array<CategoryVM>;
}

export interface CategoryStoreGetters {
  getCategoryNamedFn: ComputedRef<(categoryId: string) => string | undefined>;
}

export interface CategoryStoreActions extends StoreBaseActions {
  fetchCategory(id: string): Promise<CategoryVM | undefined>;

  fetchAllCategories(): Promise<Array<CategoryVM>>;
}
