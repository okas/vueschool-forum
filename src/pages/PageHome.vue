<template>
  <h1>Welcome to Vue School Forum</h1>
  <thread-list :threads="threads" />
</template>

<script setup lang="ts">
import ThreadList from "../components/ThreadList.vue";
import { threads } from "../data.json";
</script>

<style scoped></style>
