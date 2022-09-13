import { ComputedRef } from "vue";
import { CategoryVM } from "./../models/CategoryVM";
import { StoreBaseActions } from "./store-base-types";

export interface CategoryStoreState {
  categories: Array<CategoryVM>;
}

export interface CategoryStoreGetters {
  getCategoryNamedFn: ComputedRef<(categoryId: string) => string | undefined>;
}

export interface CategoryStoreActions extends StoreBaseActions {
  fetchCategory(id: string): Promise<CategoryVM | undefined>;

  fetchAllCategories(): Promise<Array<CategoryVM>>;
}
