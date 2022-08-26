<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import CategoryListItem from "../components/CategoryListItem.vue";
import { useMainStore } from "../stores/main-store";

const props = defineProps<{
  categoryId: string;
}>();

const store = useMainStore();

const { isReady } = useAsyncState(async () => {
  const category = await store.fetchCategory(props.categoryId);
  await store.fetchForums(category.forums);
}, undefined);

const name = computed(() => store.getCategoryNamedFn(props.categoryId));

const categoryForums = computed(() =>
  store.forums.filter(({ categoryId }) => categoryId === props.categoryId)
);
</script>

<template>
  <template v-if="isReady">
    <div class="col-full push-top">
      <h1 v-text="name" />
    </div>
    <div class="col-full">
      <category-list-item
        v-bind="{ categoryId, name, forums: categoryForums }"
      />
    </div>
  </template>
</template>

<style scoped></style>
