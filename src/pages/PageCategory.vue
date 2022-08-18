<script setup lang="ts">
import CategoryListItem from "../components/CategoryListItem.vue";
import { useMainStore } from "../stores/main-store";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  categoryId: string;
}>();

const store = useMainStore();

await store.fetchForums((await store.fetchCategory(props.categoryId)).forums);

const { name } = findById(store.categories, props.categoryId);

const categoryForums = store.forums.filter(
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
