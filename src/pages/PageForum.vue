<script setup lang="ts">
import ThreadList from "../components/ThreadList.vue";
import { useMainStore } from "../store";
import { ThreadVMWithMeta } from "../types/ThreadVMTypes";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const store = useMainStore();

const {
  name,
  description,
  threads: threadIds,
} = findById(store.forums, props.forumId);

const forumThreads: ThreadVMWithMeta[] = threadIds.map((id) =>
  store.getThreadMetaInfoFn(id)
);
</script>

<template>
  <div class="col-full push-top">
    <div class="forum-header">
      <div class="forum-details">
        <h1 v-text="name" />
        <p class="text-lead" v-text="description" />
      </div>
      <router-link
        :to="{ name: 'ThreadCreate', params: { forumId } }"
        class="btn-green btn-small"
      >
        Start a thread
      </router-link>
    </div>
  </div>

  <div class="col-full push-top">
    <thread-list :threads="forumThreads" />
  </div>
</template>

<style scoped></style>
