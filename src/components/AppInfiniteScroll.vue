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

const elem = ref<Element>();

const observer = ref<IntersectionObserver>(null);

onMounted(() => {
  const callback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach(
      ({ isIntersecting }) => isIntersecting && emits("reachedEnd")
    );

  observer.value = new IntersectionObserver(callback, {
    root: null,
    rootMargin: "0px",
    threshold: 0.9,
  });

  observer.value.observe(elem.value);
});

onBeforeUnmount(unobserve);

watch(
  () => props.done,
  (newVal) => newVal && unobserve()
);

function unobserve() {
  observer.value.unobserve(elem.value);
}
</script>

<template>
  <div ref="elem" class="intersection-observer" />
</template>

<style scoped lang="scss">
div {
  position: relative;
  z-index: -1;
  pointer-events: none;
  bottom: 200px;
}
</style>
