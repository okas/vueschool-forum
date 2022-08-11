<script setup lang="ts">
import ThreadList from "../components/ThreadList.vue";
import { useMainStore } from "../store";

const props = defineProps<{
  forumId: string;
}>();

const store = useMainStore();

const { name, description } = store.forums.find(
  ({ id }) => id === props.forumId
);

const threads = store.threads.filter(
  ({ forumId }) => forumId === props.forumId
);
</script>

<template>
  <div class="col-full push-top">
    <div class="forum-header">
      <div class="forum-details">
        <h1 v-text="name" />
        <p class="text-lead" v-text="description" />
      </div>
      <a href="new-thread.html" class="btn-green btn-small">Start a thread</a>
    </div>
  </div>

  <div class="col-full push-top">
    <thread-list :threads="threads" />
  </div>
</template>

<style scoped></style>
