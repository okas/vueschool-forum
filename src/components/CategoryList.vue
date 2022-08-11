<script setup lang="ts">
import { useMainStore } from "../store";
import { groupByToMap } from "../utils/array-helpers";
import CategoryListItem from "./CategoryListItem.vue";

const store = useMainStore();

const groupedForums = groupByToMap(
  store.forums,
  ({ categoryId }) => categoryId
);

function getCategoryName(categoryId: string) {
  return store.categories.find(({ id }) => id === categoryId).name;
}
</script>

<template>
  <div class="col-full">
    <category-list-item
      v-for="[categoryId, forums] of groupedForums"
      :key="categoryId"
      v-bind="{ categoryId, name: getCategoryName(categoryId), forums }"
    />
  </div>
</template>

<style scoped></style>
