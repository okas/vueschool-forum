<script setup lang="ts">
import { useUserStore } from "@/stores/user-store";
import type { ThreadVMWithMeta } from "@/types/threadVm-types";
import { computed } from "vue";
import ThreadListItem, { type IThreadListItem } from "./ThreadListItem.vue";

const props = defineProps<{
  threads: Array<ThreadVMWithMeta>;
  pageCount: number;
  modelValue?: number;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", val?: number): void;
}>();

const { getUserByIdFn } = useUserStore();

// @ts-expect-error Filter result is not considered correctly!
const renderData = computed<Array<IThreadListItem>>(() =>
  props.threads.map(transform).filter((x) => x)
);

const pageAtPaginator = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits("update:modelValue", val);
  },
});

function transform({
  id,
  title,
  userId,
  publishedAt,
  repliesCount,
}: ThreadVMWithMeta): IThreadListItem | undefined {
  const userData = getUserByIdFn(userId);

  if (!userData) {
    return;
  }

  const { name: userName, avatar: userAvatar } = userData;

  return {
    threadId: id,
    title,
    publishedAt,
    repliesCount,
    userName,
    userAvatar: userAvatar ?? undefined,
  };
}
</script>

<template>
  <div class="thread-list">
    <h2 class="list-title">Threads</h2>
    <div class="wrapper">
      <transition name="slide-fade" mode="out-in">
        <ul :key="pageAtPaginator">
          <thread-list-item
            v-for="thread of renderData"
            v-bind="thread"
            :key="thread.threadId"
          />
        </ul>
      </transition>
    </div>
  </div>

  <slot v-if="pageAtPaginator" name="paginator">
    <pagination-v
      v-model="pageAtPaginator"
      class="pagination"
      :pages="pageCount"
      :range-size="2"
      active-color="#57ad8d"
    />
  </slot>
</template>

<style scoped lang="scss">
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade {
  &-enter-active {
    transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
  }

  &-leave-active {
    transition: all 0.25s cubic-bezier(1, 0.5, 0.8, 1);
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
}
</style>
