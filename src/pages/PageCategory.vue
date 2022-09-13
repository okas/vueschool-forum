<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import CategoryListItem from "../components/CategoryListItem.vue";
import { useCategoryStore } from "../stores/category-store";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";

const props = defineProps<{
  categoryId: string;
}>();

const commonStore = useCommonStore();
const categoryStore = useCategoryStore();
const forumStore = useForumStore();

const { isReady } = useAsyncState(async () => {
  const category = await categoryStore.fetchCategory(props.categoryId);
  await forumStore.fetchForums(category.forums);
  commonStore.isReady = true;
}, undefined);

const name = computed(() => categoryStore.getCategoryNamedFn(props.categoryId));

const categoryForums = computed(() =>
  forumStore.forums.filter(({ categoryId }) => categoryId === props.categoryId)
);
</script>

<template>
  <template v-if="isReady">
    <div class="col-full push-top">
      <h1 v-text="name" />
    </div>
    <div class="col-full">
      <category-list-item
        v-bind="{
          categoryId,
          name,
          forums: categoryForums,
        }"
      />
    </div>
  </template>
</template>
