<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import CategoryList from "../components/CategoryList.vue";
import { useCategoryStore } from "../stores/category-store";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";
import { groupByToMap } from "../utils/array-helpers";

const commonStore = useCommonStore();
const categoryStore = useCategoryStore();
const forumStore = useForumStore();

const { isReady } = useAsyncState(async () => {
  const categories = await categoryStore.fetchAllCategories();
  const forumIds = categories.flatMap(({ forums }) => forums);
  await forumStore.fetchForums(forumIds);
  commonStore.isReady = true;
}, undefined);

const groupedForums = computed(() =>
  groupByToMap(forumStore.forums, ({ categoryId }) => categoryId)
);
</script>

<template>
  <template v-if="isReady">
    <h1 class="push-top">Welcome to Vue School Forum</h1>
    <category-list :grouped-forums="groupedForums" />
  </template>
</template>
