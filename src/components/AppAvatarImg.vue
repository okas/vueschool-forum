<script setup lang="ts">
withDefaults(defineProps<{ src?: string }>(), { src: "/user-placeholder.png" });
</script>

<template>
  <img :src="src" class="app-avatar-img" />
</template>

<style scoped>
.app-avatar-img {
  object-fit: cover;
}
</style>
