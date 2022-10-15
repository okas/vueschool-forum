<script setup lang="ts">
import type { ForumVM } from "@/models/ForumVM";
import { useCategoryStore } from "@/stores/category-store";
import { computed } from "vue";
import { useRoute } from "vue-router";
import ForumList from "./ForumList.vue";

const props = defineProps<{
  categoryId: string;
  name?: string;
  forums: Array<ForumVM>;
}>();

const categoryStore = useCategoryStore();

const { params } = useRoute();

const name = computed(
  () => props.name ?? categoryStore.getCategoryNameFn(props.categoryId)
);

const showCategoryLink = computed(() => params.categoryId !== props.categoryId);
</script>

<template>
  <div class="forum-list">
    <h2 class="list-title">
      <router-link
        v-if="showCategoryLink"
        :to="{
          name: 'Category',
          params: { categoryId },
        }"
      >
        {{ name }}
      </router-link>
      <span v-else v-text="name" />
    </h2>
    <forum-list :forums="forums" />
  </div>
</template>
