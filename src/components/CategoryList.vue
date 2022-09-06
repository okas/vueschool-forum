<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ForumVM } from "../models/ForumVM";
import { useMainStore } from "../stores/main-store";
import CategoryListItem from "./CategoryListItem.vue";

defineProps<{
  groupedForums: Map<string, Array<ForumVM>>;
}>();

const { getCategoryNamedFn } = storeToRefs(useMainStore());
</script>

<template>
  <div class="col-full">
    <category-list-item
      v-for="[categoryId, forums] of groupedForums"
      :key="categoryId"
      v-bind="{
        categoryId,
        name: getCategoryNamedFn(categoryId),
        forums,
      }"
    />
  </div>
</template>
