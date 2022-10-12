<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "../stores/user-store";
import type { ThreadVMWithMeta } from "../types/threadVm-types";
import ThreadListItem from "./ThreadListItem.vue";

const props = defineProps<{
  threads: Array<ThreadVMWithMeta>;
}>();

const { getUserByIdFn } = useUserStore();

const renderData = computed(() =>
  props.threads.map(({ id, title, userId, publishedAt, repliesCount }) => {
    const { name: userName, avatar: userAvatar } = getUserByIdFn(userId);

    return {
      threadId: id,
      title,
      publishedAt,
      repliesCount,
      userName,
      userAvatar,
    };
  })
);
</script>

<template>
  <div class="thread-list">
    <h2 class="list-title">Threads</h2>

    <thread-list-item
      v-for="thread of renderData"
      :key="thread.threadId"
      v-bind="thread"
    />
  </div>

  <slot></slot>
</template>
