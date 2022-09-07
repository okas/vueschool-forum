<script setup lang="ts">
import { useAsyncState, useConfirmDialog } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import PostEditor from "../components/PostEditor.vue";
import PostList from "../components/PostList.vue";
import { useMainStore } from "../stores/main-store";
import { PostVMEdit, PostVMFormInput, PostVMNew } from "../types/postVm-types";
import { getCountPhrase } from "../utils/misc";

const props = defineProps<{
  threadId: string;
}>();

const store = useMainStore();

const { isReady } = useAsyncState(async () => {
  const { userId, posts } = await store.fetchThread(props.threadId);
  const threadPosts = await store.fetchPosts(posts);
  const postUserIds = threadPosts.map(({ userId }) => userId);
  await Promise.allSettled([store.fetchUsers([userId, ...postUserIds])]);
  store._isReady = true;
}, undefined);

const { isRevealed, reveal, confirm } = useConfirmDialog();

const hasDirtyForm = ref<boolean>(false);
const hasDirtyFormInPostList = ref<boolean>(false);

const thread = computed(() => store.getThreadMetaInfoFn(props.threadId));

const posts = computed(() =>
  store.posts
    .filter(({ threadId }) => threadId === thread.value.id)
    .sort(({ publishedAt: a }, { publishedAt: b }) => a - b)
);

const statsPhrase = computed(
  () =>
    `${getCountPhrase(thread.value.repliesCount, "reply")} by ${getCountPhrase(
      thread.value.contributorsCount,
      "contributor"
    )}`
);

provide(confirmInjectKey, confirm);

onBeforeRouteLeave(async () => {
  if (hasDirtyForm.value || hasDirtyFormInPostList.value) {
    return (await reveal()).data;
  }
});

async function addPost(dto: PostVMFormInput) {
  const post: PostVMNew = {
    threadId: props.threadId,
    ...dto,
  };

  await store.createPost(post);
}

async function editPost(dto: PostVMEdit) {
  await store.editPost(dto);
}
</script>

<template>
  <div v-if="isReady" class="col-large push-top">
    <!-- <ul class="breadcrumbs"></ul>
      <li>
        <a href="#"><i class="fa fa-home fa-btn"></i>Home</a>
      </li>
      <li><a href="category.html">Discussions</a></li>
      <li class="active"><a href="#">Cooking</a></li>
    </ul> -->

    <header style="display: flex">
      <h1 style="margin-right: 1rem" v-text="thread?.title" />
      <router-link
        v-slot="{ navigate }"
        :to="{
          name: 'ThreadEdit',
          params: { threadId },
        }"
        custom
      >
        <button class="btn-green btn-small" @click="navigate">
          Edit thread
        </button>
      </router-link>
    </header>

    <p style="display: flex; justify-content: space-between">
      <span style="margin-top: 0.125rem">
        By
        <a href="#" class="link-unstyled">{{ thread.authorName }}</a
        >, <app-date :timestamp="thread.lastPostAt" />.
      </span>
      <span
        style="margin-top: 0.125rem"
        class="hide-mobile text-faded text-small"
        v-text="statsPhrase"
      />
    </p>

    <post-list
      v-model:is-dirty="hasDirtyFormInPostList"
      :posts="posts"
      @edit="editPost"
    />

    <post-editor v-model:is-dirty="hasDirtyForm" @save="addPost">
      {{ thread?.title }}
    </post-editor>
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
