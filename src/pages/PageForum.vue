<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import ThreadList from "../components/ThreadList.vue";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";
import { useThreadStore } from "../stores/threads-store";
import { useUserStore } from "../stores/user-store";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const commonStore = useCommonStore();
const forumStore = useForumStore();
const userStore = useUserStore();
const threadStore = useThreadStore();

const { isReady } = useAsyncState(async () => {
  const forum = await forumStore.fetchForum(props.forumId);
  const forumThreads = await threadStore.fetchThreads(forum.threads);
  await userStore.fetchUsers(forumThreads.map(({ userId }) => userId));
  commonStore.isReady = true;
}, undefined);

const forum = computed(() => findById(forumStore.forums, props.forumId));

const forumThreads = computed(() =>
  forum.value.threads?.map((id) => threadStore.getThreadMetaInfoFn(id))
);
</script>

<template>
  <template v-if="isReady">
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
</template>
