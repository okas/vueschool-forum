<script lang="ts">
const defaultSrc = "/user-placeholder.png";
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string | undefined;
  }>(),
  {
    src: defaultSrc,
  }
);
</script>

<template>
  <img :src="src" class="app-avatar-img" />
</template>

<style scoped>
.app-avatar-img {
  object-fit: cover;
}
</style>
