<script setup lang="ts">
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

const name = computed(() => categoryStore.getCategoryNamedFn(props.categoryId));

const categoryForums = computed(() =>
  forumStore.items.filter(({ categoryId }) => categoryId === props.categoryId)
);

commonStore.setReady();
</script>

<template>
  <template v-if="commonStore.isReady">
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
