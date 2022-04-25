<script setup lang="ts">
import { diffFromUnix, formatFromUnix } from "../utils/dateTimeDiffFormat";

defineProps<{
  timestamp: number;
}>();
</script>

<template>
  <span v-text="diffFromUnix(timestamp)" :title="formatFromUnix(timestamp)" />
</template>

<style scoped></style>
