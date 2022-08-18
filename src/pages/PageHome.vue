<script setup lang="ts">
import CategoryList from "../components/CategoryList.vue";
import { useMainStore } from "../stores/main-store";

const store = useMainStore();

await store.fetchForums(
  (await store.fetchAllCategories()).flatMap(({ forums }) => forums)
);
</script>

<template>
  <h1 class="push-top">Welcome to Vue School Forum</h1>
  <category-list />
</template>

<style scoped></style>
