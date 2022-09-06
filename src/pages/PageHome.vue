<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import CategoryList from "../components/CategoryList.vue";
import { useMainStore } from "../stores/main-store";
import { groupByToMap } from "../utils/array-helpers";

const store = useMainStore();

const { isReady } = useAsyncState(async () => {
  const categories = await store.fetchAllCategories();
  const forumIds = categories.flatMap(({ forums }) => forums);
  await store.fetchForums(forumIds);
  store._isReady = true;
}, undefined);

const groupedForums = computed(() =>
  groupByToMap(store.forums, ({ categoryId }) => categoryId)
);
</script>

<template>
  <template v-if="isReady">
    <h1 class="push-top">Welcome to Vue School Forum</h1>
    <category-list :grouped-forums="groupedForums" />
  </template>
</template>
