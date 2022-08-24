<script setup lang="ts">
import { computed } from "vue";
import CategoryListItem from "../components/CategoryListItem.vue";
import { useMainStore } from "../stores/main-store";

const props = defineProps<{
  categoryId: string;
}>();

const store = useMainStore();
// < FETCH
await store.fetchForums((await store.fetchCategory(props.categoryId)).forums);
// > FETCH
const name = computed(() => store.getCategoryNamedFn(props.categoryId));

const categoryForums = computed(() =>
  store.forums.filter(({ categoryId }) => categoryId === props.categoryId)
);
</script>

<template>
  <div class="col-full push-top">
    <h1 v-text="name" />
  </div>
  <div class="col-full">
    <category-list-item v-bind="{ categoryId, name, forums: categoryForums }" />
  </div>
</template>

<style scoped></style>
