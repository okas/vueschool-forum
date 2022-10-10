<script setup lang="ts">
import { reactiveComputed, useConfirmDialog, watchDebounced } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import PostEditor from "../components/PostEditor.vue";
import PostList from "../components/PostList.vue";
import useNotifications from "../composables/useNotifications";
import { PostVm } from "../models/PostVm";
import { useCommonStore } from "../stores/common-store";
import { usePostStore } from "../stores/post-store";
import { useThreadStore } from "../stores/thread-store";
import { useUserStore } from "../stores/user-store";
import { PostVMEdit, PostVMFormInput, PostVMNew } from "../types/postVm-types";
import { ThreadVMWithMeta } from "../types/threadVm-types";
import { getCountPhrase } from "../utils/misc";

interface IPageViewModel {
  thread: ThreadVMWithMeta;
  posts: Array<PostVm>;
}

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

const { addNotification } = useNotifications();
const { isRevealed, reveal, confirm } = useConfirmDialog<boolean, boolean, boolean>();

const isEditing = ref(false);
const hasDirtyForm = ref(false);
const hasDirtyFormInPostList = ref(false);
const postIdsInRefresh = ref<Array<string> | undefined>();
const notificationTimeoutMs = ref(5000);

const pageViewModel: IPageViewModel = reactiveComputed<IPageViewModel>(() => {
  const thread = threadStore.getThreadMetaInfoFn(props.threadId);

  const posts = postStore.items
    .filter(({ threadId }) => threadId === thread.id)
    .sort(({ publishedAt: a }, { publishedAt: b }) => a - b);

  return { thread, posts };
});

const statsPhrase = computed(
  () =>
    `${getCountPhrase(pageViewModel.thread.repliesCount, "reply")} by ${getCountPhrase(
      pageViewModel.thread.contributorsCount,
      "contributor"
    )}`
);

const isOwner = computed(() => pageViewModel.thread.userId === userStore.authUserId);

provide(confirmInjectKey, confirm);

const unWatch = watchDebounced(
  pageViewModel,
  async (undatedGraph) => {
    conditionallyNotifyThreadGraphChange();
    (await getEditingCompletionCondition(undatedGraph)) && (isEditing.value = false);
  },
  {
    deep: true,
    debounce: 500,
  }
);

onBeforeRouteLeave(async () => {
  let isOK = true;

  if (hasDirtyForm.value || hasDirtyFormInPostList.value) {
    isOK = (await reveal(false)).data;
  }

  isOK && unWatch();

  return isOK;
});

async function addPost(dto?: PostVMFormInput) {
  if (!dto) {
    return;
  }

  const post: PostVMNew = {
    threadId: props.threadId,
    ...dto,
  };

  isEditing.value = true;
  await postStore.createPost(post);
}

async function editPost(dto?: PostVMEdit) {
  if (!dto) {
    return;
  }

  isEditing.value = true;
  await postStore.editPost(dto);
}

function conditionallyNotifyThreadGraphChange() {
  !commonStore.isReady ||
    isEditing.value ||
    postIdsInRefresh.value?.length ||
    addNotification({ message: "Thread updated" }, notificationTimeoutMs.value);
}

async function getEditingCompletionCondition({
  thread,
  posts,
}: IPageViewModel): Promise<boolean> {
  postIdsInRefresh.value = undefined;

  const postDiff = thread.posts.filter((pId) => !posts.find(({ id }) => id === pId));

  if (!postDiff.length) {
    return true;
  }

  await postStore.fetchPosts(postDiff);
  postIdsInRefresh.value = postDiff;

  return false;
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
      <h1 style="margin-right: 1rem" v-text="pageViewModel?.thread.title" />
      <router-link
        v-if="isOwner"
        v-slot="{ navigate }"
        :to="{ name: 'ThreadEdit', params: { threadId } }"
        custom
      >
        <button class="btn-green btn-small" @click="navigate">Edit thread</button>
      </router-link>
    </header>

    <p style="display: flex; justify-content: space-between">
      <span style="margin-top: 0.125rem">
        By
        <a href="#" class="link-unstyled">{{ pageViewModel.thread.authorName }}</a
        >, <app-date :timestamp="pageViewModel.thread.lastPostAt" />.
      </span>
      <span
        style="margin-top: 0.125rem"
        class="hide-mobile text-faded text-small"
        v-text="statsPhrase"
      />
    </p>

    <post-list
      v-model:is-dirty="hasDirtyFormInPostList"
      :posts="pageViewModel?.posts"
      @edit="editPost"
    />

    <post-editor
      v-if="!!userStore.authUserId"
      v-model:is-dirty="hasDirtyForm"
      @save="addPost"
    >
      {{ pageViewModel?.thread.title }}
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
