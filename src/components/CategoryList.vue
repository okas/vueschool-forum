<script setup lang="ts">
import type { ForumVM } from "@/models/ForumVM";
import CategoryListItem from "./CategoryListItem.vue";

defineProps<{
  groupedForums: Map<string, Array<ForumVM>>;
}>();
</script>

<template>
  <div class="col-full">
    <category-list-item
      v-for="[categoryId, forums] of groupedForums"
      :key="categoryId"
      v-bind="{
        categoryId,
        forums,
      }"
    />
  </div>
</template>
