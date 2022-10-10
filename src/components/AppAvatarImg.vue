<script setup lang="ts">
withDefaults(defineProps<{ src?: string }>(), { src: "/user-placeholder.png" });
</script>

<template>
  <img :src="src" />
</template>
