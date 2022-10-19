<script setup lang="ts">
import PostEditor from "@/components/PostEditor.vue";
import PostList from "@/components/PostList.vue";
import useNotifications from "@/composables/useNotifications";
import type { PostVm } from "@/models/PostVm";
import { useCommonStore } from "@/stores/common-store";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import { useUserStore } from "@/stores/user-store";
import type { PostVMEdit, PostVMFormInput, PostVMNew } from "@/types/postVm-types";
import type { ThreadVMWithMeta } from "@/types/threadVm-types";
import { getCountPhrase } from "@/utils/misc";
import { watchDebounced } from "@vueuse/core";
import { computed, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

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

const isEditing = ref(false);
const hasDirtyForm = ref(false);
const hasDirtyFormInPostList = ref(false);
const postIdsInRefresh = ref<Array<string> | undefined>();
const notificationTimeoutMs = ref(5000);

const pageViewModel = computed<IPageViewModel | undefined>(() => {
  const thread = threadStore.getThreadMetaInfoFn(props.threadId);

  if (!thread) {
    return;
  }

  const posts = postStore.items
    .filter(({ threadId }) => threadId === thread.id)
    .sort(({ publishedAt: a }, { publishedAt: b }) => a - b);

  return { thread, posts } as IPageViewModel;
});

const statsPhrase = computed<string | undefined>(() => {
  if (!pageViewModel.value) {
    return;
  }

  const part1 = getCountPhrase(pageViewModel.value.thread.repliesCount, "reply");
  const part2 = getCountPhrase(
    pageViewModel.value.thread.contributorsCount,
    "contributor"
  );

  return `${part1} by ${part2}`;
});

const isOwner = computed<boolean>(
  () => pageViewModel.value?.thread.userId === userStore.authUserId
);

const confirmationRevealCondition = computed(
  () => hasDirtyForm.value || hasDirtyFormInPostList.value
);

const unWatch = watchDebounced(
  pageViewModel,
  async (undatedGraph) => {
    if (!undatedGraph) {
      return;
    }

    conditionallyNotifyThreadGraphChange();

    (await getEditingCompletionCondition(undatedGraph)) && setEditing(false);
  },
  {
    deep: true,
    debounce: 500,
  }
);

onBeforeRouteLeave(unWatch);

function addPost(dto?: PostVMFormInput) {
  if (!dto) {
    return;
  }

  const post: PostVMNew = {
    threadId: props.threadId,
    ...dto,
  };

  setEditing();

  postStore.createPost(post);
}

function editPost(dto?: PostVMEdit) {
  if (!dto) {
    return;
  }

  setEditing();

  postStore.editPost(dto);
}

function conditionallyNotifyThreadGraphChange() {
  !commonStore.isReady ||
    isEditing.value ||
    postIdsInRefresh.value?.length ||
    addNotification({ message: "Thread updated" }, notificationTimeoutMs.value);
}

function setEditing(stateForced = true) {
  isEditing.value = stateForced;
  commonStore.setLoading(stateForced);
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
  <div v-if="commonStore.isReady && pageViewModel" class="col-large push-top">
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

  <app-nav-confirmation-modal :reveal-condition="confirmationRevealCondition" />
</template>
