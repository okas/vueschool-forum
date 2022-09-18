<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import PostEditor from "../components/PostEditor.vue";
import PostList from "../components/PostList.vue";
import { useCommonStore } from "../stores/common-store";
import { usePostStore } from "../stores/post-store";
import { useThreadStore } from "../stores/threads-store";
import { useUserStore } from "../stores/user-store";
import { PostVMEdit, PostVMFormInput, PostVMNew } from "../types/postVm-types";
import { getCountPhrase } from "../utils/misc";

const props = defineProps<{
  threadId: string;
}>();

const commonStore = useCommonStore();
const postStore = usePostStore();
const userStore = useUserStore();
const threadStore = useThreadStore();
const route = useRoute();

const query = { redirectTo: route.path };
const signInRoute = { name: "SignIn", query };
const registerRoute = { name: "Register", query };

const { isRevealed, reveal, confirm } = useConfirmDialog();

const hasDirtyForm = ref<boolean>(false);
const hasDirtyFormInPostList = ref<boolean>(false);

const thread = computed(() => threadStore.getThreadMetaInfoFn(props.threadId));

const posts = computed(() =>
  postStore.posts
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

const isOwner = computed(() => thread.value.userId === userStore.authUserId);

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

  await postStore.createPost(post);
}

async function editPost(dto: PostVMEdit) {
  await postStore.editPost(dto);
}

commonStore.setReady();
</script>

<template>
  <div v-if="commonStore.isReady" class="col-large push-top">
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
        v-if="isOwner"
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

    <post-editor
      v-if="!!userStore.authUserId"
      v-model:is-dirty="hasDirtyForm"
      @save="addPost"
    >
      {{ thread?.title }}
    </post-editor>

    <div v-else class="text-center" style="margin: 3rem 0">
      <router-link :to="signInRoute">Sign In</router-link>
      or
      <router-link :to="registerRoute">Register</router-link>
      to reply.
    </div>
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
