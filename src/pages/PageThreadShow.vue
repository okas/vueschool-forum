<script setup lang="ts">
import { computed } from "vue";
import PostList from "../components/PostList.vue";
import { threads, posts } from "../data.json";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const thread = computed(() => threads.find(({ id }) => id === props.id));

const threadPosts = computed(() =>
  posts.filter(({ threadId }) => threadId === thread.value.id)
);
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

    <h1 v-text="thread.title" />

    <!-- <p>
      By <a href="#" class="link-unstyled">Robin</a>, 2 hours ago.
      <span
        style="float: right; margin-top: 2px"
        class="hide-mobile text-faded text-small"
        >3 replies by 3 contributors</span
      >
    </p> -->

    <post-list :posts="threadPosts" />
  </div>
</template>

<style scoped></style>
