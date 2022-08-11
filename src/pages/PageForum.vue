<script setup lang="ts">
import { computed } from "vue";
import ThreadList from "../components/ThreadList.vue";
import { useMainStore } from "../store";

const props = defineProps<{
  id: string;
}>();

const store = useMainStore();

const forum = computed(() => store.forums.find(({ id }) => id === props.id));
const forumThreads = computed(() =>
  store.threads.filter(({ forumId }) => forumId === props.id)
);
</script>

<template>
  <div class="col-full push-top">
    <div class="forum-header">
      <div class="forum-details">
        <h1 v-text="forum.name" />
        <p class="text-lead" v-text="forum.description" />
      </div>
      <a href="new-thread.html" class="btn-green btn-small">Start a thread</a>
    </div>
  </div>

  <div class="col-full push-top">
    <thread-list :threads="forumThreads" />
  </div>
</template>

<style scoped></style>
