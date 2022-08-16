<script setup lang="ts">
import { computed } from "vue";
import PostEditor from "../components/PostEditor.vue";
import PostList from "../components/PostList.vue";
import { useMainStore } from "../store";
import { PostVMFormInput, PostVMNew } from "../types/PostVMTypes";

const props = defineProps<{
  threadId: string;
}>();

const store = useMainStore();

const thread = store.getThreadMetaInfoFn(props.threadId);

const posts = computed(() =>
  store.posts.filter(({ threadId }) => threadId === thread.id)
);

const statsPhrase = computed(
  () =>
    `${thread.repliesCount} replies by ${
      thread.contributors?.length ?? 0
    } contributors.`
);

function addPost(dto: PostVMFormInput) {
  const post: PostVMNew = {
    threadId: props.threadId,
    ...dto,
  };

  store.createPost(post);
}
</script>

<template>
  <div class="col-large push-top">
    <!-- <ul class="breadcrumbs"></ul>
      <li>
        <a href="#"><i class="fa fa-home fa-btn"></i>Home</a>
      </li>
      <li><a href="category.html">Discussions</a></li>
      <li class="active"><a href="#">Cooking</a></li>
    </ul> -->

    <header style="display: flex">
      <h1 style="margin-right: 1rem" v-text="thread.title" />
      <router-link
        v-slot="{ navigate }"
        :to="{ name: 'ThreadEdit', params: { threadId } }"
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

    <post-list :posts="posts" />

    <post-editor class="col-full" @save="addPost">
      {{ thread.title }}
    </post-editor>
  </div>
</template>

<style scoped></style>
