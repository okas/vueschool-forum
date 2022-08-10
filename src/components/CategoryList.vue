<script setup lang="ts">
import { categories, forums } from "../data.json";
import { groupByToMap } from "../utils/array-helpers";
import CategoryListItem from "./CategoryListItem.vue";

const groupedForums = groupByToMap(forums, ({ categoryId }) => categoryId);
</script>

<template>
  <div class="col-full">
    <category-list-item
      v-for="{ id, name } of categories"
      :key="id"
      v-bind="{ categoryId: id, name, forums: groupedForums.get(id) }"
    />
  </div>
</template>

<style scoped></style>
