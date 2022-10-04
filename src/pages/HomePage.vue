<script setup lang="ts">
import { computed } from "vue";
import CategoryList from "../components/CategoryList.vue";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";
import { groupByToMap } from "../utils/array-helpers";

const commonStore = useCommonStore();
const forumStore = useForumStore();

const groupedForums = computed(() =>
  groupByToMap(forumStore.items, ({ categoryId }) => categoryId)
);

commonStore.setReady();
</script>

<template>
  <template v-if="commonStore.isReady">
    <h1 class="push-top">Welcome to Vue School Forum</h1>
    <category-list :grouped-forums="groupedForums" />
  </template>
</template>
