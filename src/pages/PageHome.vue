<template>
  <h1>Welcome to Vue School Forum</h1>
  <forum-list :forums="forums" />
</template>

<script setup lang="ts">
import ForumList from "../components/ForumList.vue";
import { forums } from "../data.json";
</script>

<style scoped></style>
