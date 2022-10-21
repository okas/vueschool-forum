<script lang="ts">
const defaultSrc = "/user-placeholder.png";
</script>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(
  defineProps<{
    src?: string | undefined;
  }>(),
  {
    src: defaultSrc,
  }
);

const isImgLoaded = ref(false);

function imageLoaded(state = true) {
  isImgLoaded.value = true;
}
</script>

<template>
  <img
    :key="src"
    :src="src"
    class="avatar"
    :class="{ show: isImgLoaded }"
    loading="lazy"
    referrerPolicy="no-referrer"
    @load="imageLoaded()"
  />
</template>

<style scoped lang="scss">
.avatar {
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.avatar.show {
  opacity: 1;
}
</style>
