<script setup lang="ts">
import { diffFromUnix, formatFromUnix } from "@/utils/dateTimeDiffFormat";

defineProps<{
  timestamp: number;
}>();
</script>

<template>
  <span :title="formatFromUnix(timestamp)" v-text="diffFromUnix(timestamp)" />
</template>
