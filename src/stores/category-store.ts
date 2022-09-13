import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { hasIdVmConverter } from "../firebase/firebase-converters";
import { CategoryVM } from "../models/CategoryVM";
import {
  CategoryStoreActions,
  CategoryStoreGetters,
  CategoryStoreState,
} from "../types/category-store-types";
import { findById } from "../utils/array-helpers";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";
import useAcceptHmr from "./helpers";
import { StoreBase } from "./store-base";

export const useCategoryStore = defineStore(
  "category-store",
  (): CategoryStoreState & CategoryStoreGetters & CategoryStoreActions => {
    const baseActions = new StoreBase();
    const { _dbUnsubscribes } = baseActions;

    const categories = reactive<Array<CategoryVM>>([]);

    const getCategoryNamedFn = computed(
      () => (categoryId: string) => findById(categories, categoryId)?.name
    );

    const fetchCategory = makeFirebaseFetchSingleDocFn(
      categories,
      "categories",
      _dbUnsubscribes,
      hasIdVmConverter
    );

    function fetchAllCategories() {
      return makeFirebaseFetchMultiDocsFn(
        categories,
        "categories",
        _dbUnsubscribes,
        hasIdVmConverter
      )();
    }

    return {
      categories,
      getCategoryNamedFn,
      fetchCategory,
      fetchAllCategories,
      clearDbSubscriptions: () => baseActions.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useCategoryStore);
