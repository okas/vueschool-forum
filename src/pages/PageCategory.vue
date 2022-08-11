<script setup lang="ts">
import CategoryListItem from "../components/CategoryListItem.vue";
import { useMainStore } from "../store";

const props = defineProps<{
  categoryId: string;
}>();

const store = useMainStore();

const { name } = store.categories.find(({ id }) => id === props.categoryId);

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
