import { FabCollection } from "@/firebase/firebase-collections-enum";
import { hasIdVmConverter } from "@/firebase/firebase-converters";
import { FirebaseSubscriptionManager } from "@/firebase/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/firebase/store-firebase-action-sinks";
import type { CategoryVM } from "@/models/CategoryVM";
import type {
  CategoryStoreActions,
  CategoryStoreGetters,
  CategoryStoreState,
} from "@/types/category-store-types";
import { findById } from "@/utils/array-helpers";
import useAcceptHmr from "@/utils/store-helpers";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useCategoryStore = defineStore(
  "category-store",
  (): CategoryStoreState & CategoryStoreGetters & CategoryStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const items = reactive<Array<CategoryVM>>([]);

    const getCategoryNameFn = computed(
      () => (categoryId: string) => findById(items, categoryId)?.name
    );

    const fetchCategory = makeFirebaseFetchSingleDocFn(
      items,
      FabCollection.categories,
      _dbUnsubscribes,
      hasIdVmConverter
    );

    function fetchAllCategories() {
      return makeFirebaseFetchMultiDocsFn(
        items,
        FabCollection.categories,
        _dbUnsubscribes,
        hasIdVmConverter
      )();
    }

    return {
      items,
      getCategoryNameFn,
      fetchCategory,
      fetchAllCategories,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useCategoryStore);
