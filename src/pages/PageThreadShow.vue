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

const thread = store.threads.find(({ id }) => id === props.threadId);

const posts = computed(() =>
  store.posts.filter(({ threadId }) => threadId === thread.id)
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
  <div>
    <!-- <ul class="breadcrumbs">
      <li>
        <a href="#"><i class="fa fa-home fa-btn"></i>Home</a>
      </li>
      <li><a href="category.html">Discussions</a></li>
      <li class="active"><a href="#">Cooking</a></li>
    </ul> -->

    <span>
      <h1 v-text="thread.title" />
      <router-link
        class="btn-green btn-small"
        :to="{ name: 'ThreadEdit', params: { threadId } }"
      >
        Edit thread
      </router-link>
    </span>

    <!-- <p>
      By <a href="#" class="link-unstyled">Robin</a>, 2 hours ago.
      <span
        style="float: right; margin-top: 2px"
        class="hide-mobile text-faded text-small"
        >3 replies by 3 contributors</span
      >
    </p> -->
    <post-list :posts="posts" />

    <post-editor class="col-full" @save="addPost">
      {{ thread.title }}
    </post-editor>
  </div>
</template>

<style scoped></style>
