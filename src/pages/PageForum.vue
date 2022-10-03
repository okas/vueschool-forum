<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ThreadList from "../components/ThreadList.vue";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";
import { useThreadStore } from "../stores/thread-store";
import { useUserStore } from "../stores/user-store";
import { ThreadVMWithMeta } from "../types/threadVm-types";
import { findById } from "../utils/array-helpers";

const pageSize = 10;

const props = defineProps<{
  forumId: string;
}>();

const commonStore = useCommonStore();
const forumStore = useForumStore();
const userStore = useUserStore();
const threadStore = useThreadStore();

const router = useRouter();
const route = useRoute();

useAsyncState(async () => {
  await fetchPagedViewModels();
}, undefined);

const pageAtUri = computed(() => {
  const { page } = route.query;
  const result = parseInt(Array.isArray(page) ? page[0] : page);

  return isNaN(result) ? 1 : result;
});

const pageAtPaginator = ref<number>(pageAtUri.value);

const currentPageOfThreads = ref<Array<ThreadVMWithMeta>>([]);

const forum = computed(() => findById(forumStore.items, props.forumId));

const pageCount = computed(() =>
  Math.ceil((forum.value.threads?.length ?? 0) / pageSize)
);

watch(pageAtPaginator, () =>
  router.push({ query: { page: pageAtPaginator.value } })
);

watch(pageAtUri, (newPage) => {
  commonStore.setLoading();
  pageAtPaginator.value = newPage;
  fetchPagedViewModels();
});

async function fetchPagedViewModels(): Promise<void> {
  await nextTick();

  const threads = await threadStore.fetchThreadsByPage(
    pageAtUri.value,
    pageSize,
    forum.value.threads
  );

  await userStore.fetchUsers(threads.map(({ userId }) => userId));

  currentPageOfThreads.value =
    threads
      .filter(({ forumId }) => forumId === props.forumId)
      .map(({ id }) => threadStore.getThreadMetaInfoFn(id)) ?? [];

  commonStore.setReady();
}
</script>

<template>
  <template v-if="commonStore.isReady">
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
      <thread-list v-if="currentPageOfThreads" :threads="currentPageOfThreads">
        <v-pagination
          v-model="pageAtPaginator"
          class="pagination"
          :pages="pageCount"
          :range-size="1"
          active-color="#57ad8d"
        />
      </thread-list>
      <div v-else>No threads</div>
    </div>
  </template>
</template>
