<script setup lang="ts">
import { computed } from "vue";
import ThreadList from "../components/ThreadList.vue";
import { useMainStore } from "../stores/main-store";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const store = useMainStore();
// < FETCH
await store.fetchUsers(
  (
    await store.fetchThreads((await store.fetchForum(props.forumId)).threads)
  ).map(({ userId }) => userId)
);
// > FETCH
const forum = computed(() => findById(store.forums, props.forumId));

const forumThreads = computed(() =>
  forum.value.threads?.map((id) => store.getThreadMetaInfoFn(id))
);
</script>

<template>
  <div class="col-full push-top">
    <div class="forum-header">
      <div v-if="forum" class="forum-details">
        <h1 v-text="forum.name" />
        <p class="text-lead" v-text="forum.description" />
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
    <thread-list v-if="forumThreads" :threads="forumThreads" />
    <div v-else>No threads</div>
  </div>
</template>

<style scoped></style>
