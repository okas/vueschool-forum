<script setup lang="ts">
import { extractFromUnixTS, formatTime } from "@/utils/date-time-helpers";
import { useTimeAgo } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    time: number | Date;
    updateInterval?: number;
  }>(),
  { updateInterval: 10_000 }
);

const { timeAgo } = useTimeAgo(extractFromUnixTS(props.time), {
  controls: true,
  showSecond: true,
  updateInterval: props.updateInterval,
});
</script>

<template>
  <span :title="formatTime(time)" v-text="timeAgo" />
</template>
