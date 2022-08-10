<script setup lang="ts">
import CategoryListItem from "../components/CategoryListItem.vue";

import { categories, forums } from "../data.json";

const props = defineProps({
  categoryId: { type: String, required: true },
});

const { name } = categories.find(({ id }) => id === props.categoryId);

const categoryForums = forums.filter(
  ({ categoryId }) => categoryId === props.categoryId
);
</script>

<template>
  <div class="col-full push-top">
    <h1 v-text="name" />
  </div>
  <div class="col-full">
    <category-list-item v-bind="{ categoryId, name, forums: categoryForums }" />
  </div>
</template>

<style scoped></style>
