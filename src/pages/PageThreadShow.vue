<script setup lang="ts">
import { computed, reactive } from "vue";
import PostList from "../components/PostList.vue";
import PostEditor from "../components/PostEditor.vue";
import { threads, posts } from "../data.json";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

// to overcome JSON data source, using suffixes to distinguish types of vars
const threadsR = reactive(threads);
const postsR = reactive(posts);

const threadC = computed(() => threadsR.find(({ id }) => id === props.id));

const threadPostsC = computed(() =>
  postsR.filter(({ threadId }) => threadId === threadC.value.id)
);

function addPost({ id, ...rest }) {
  const post = {
    id,
    threadId: props.id,
    ...rest,
  };

  postsR.push(post);
  threadC.value.posts.push(id);
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
    <h1 v-text="threadC.title" />
    <!-- <p>
      By <a href="#" class="link-unstyled">Robin</a>, 2 hours ago.
      <span
        style="float: right; margin-top: 2px"
        class="hide-mobile text-faded text-small"
        >3 replies by 3 contributors</span
      >
    </p> -->
    <post-list :posts="threadPostsC" />
    <post-editor @save="addPost" class="col-full">
      {{ threadC.title }}
    </post-editor>
  </div>
</template>

<style scoped></style>
