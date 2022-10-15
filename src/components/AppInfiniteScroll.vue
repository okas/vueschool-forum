<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    done: boolean;
  }>(),
  { done: false }
);

const emits = defineEmits<{
  (e: "reachedEnd"): void;
}>();

const refElem = ref<HTMLElement | undefined>();

const observer = ref<IntersectionObserver | undefined>();

onMounted(() => {
  const callback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach(({ isIntersecting }) => isIntersecting && emits("reachedEnd"));

  observer.value = new IntersectionObserver(callback, {
    root: null,
    rootMargin: "0px",
    threshold: 0.9,
  });

  refElem.value && observer.value.observe(refElem.value);
});

onBeforeUnmount(unobserve);

watch(
  () => props.done,
  (newVal) => newVal && unobserve()
);

function unobserve() {
  refElem.value && observer.value?.unobserve(refElem.value);
}
</script>

<template>
  <div ref="refElem" class="intersection-observer" />
</template>

<style scoped lang="scss">
div {
  position: relative;
  z-index: -1;
  pointer-events: none;
  bottom: 200px;
}
</style>
