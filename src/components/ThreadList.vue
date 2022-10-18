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
  (e: "update:modelValue", val: number): void;
}>();

const { getUserByIdFn } = useUserStore();

const renderData = computed<Array<IThreadListItem>>(() => [
  ...props.threads.map(transform),
]);

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

    <slot v-bind="renderData">
      <thread-list-item
        v-for="thread of renderData"
        :key="thread.threadId"
        v-bind="thread"
      />
    </slot>
  </div>

  <slot v-if="pageAtPaginator" name="paginator">
    <pagination-v
      v-model="pageAtPaginator"
      class="pagination"
      :pages="pageCount"
      :range-size="1"
      active-color="#57ad8d"
    />
  </slot>
</template>
