<script setup lang="ts">
import { useMainStore } from "../store";
import { groupByToMap } from "../utils/array-helpers";
import CategoryListItem from "./CategoryListItem.vue";

const store = useMainStore();

const groupedForums = groupByToMap(
  store.forums,
  ({ categoryId }) => categoryId
);
</script>

<template>
  <div class="col-full">
    <category-list-item
      v-for="{ id, name } of store.categories"
      :key="id"
      v-bind="{ categoryId: id, name, forums: groupedForums.get(id) }"
    />
  </div>
</template>

<style scoped></style>
