<script setup lang="ts">
import { computed } from "vue";
import CategoryList from "../components/CategoryList.vue";
import { useMainStore } from "../stores/main-store";
import { groupByToMap } from "../utils/array-helpers";

const store = useMainStore();
// < FETCH
await store.fetchForums(
  (await store.fetchAllCategories()).flatMap(({ forums }) => forums)
);
// > FETCH
const groupedForums = computed(() =>
  groupByToMap(store.forums, ({ categoryId }) => categoryId)
);
</script>

<template>
  <h1 class="push-top">Welcome to Vue School Forum</h1>
  <category-list :grouped-forums="groupedForums" />
</template>

<style scoped></style>
