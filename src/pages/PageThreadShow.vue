<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { guidAsBase64 } from "../utils/index";
import PostList from "../components/PostList.vue";
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

const newPostTextRf = ref<string>(null);

function addPost() {
  const id = guidAsBase64();

  const post = {
    id,
    text: newPostTextRf.value,
    publishedAt: Math.floor(Date.now() / 1000),
    threadId: props.id,
    userId: "NnooaWj4KHVxbhKwO1pEdfaQDsD2",
  };

  postsR.push(post);
  threadC.value.posts.push(id);

  newPostTextRf.value = null;
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
    <div class="col-full">
      <h1>Create new thread in <i v-text="threadC.title" /></h1>
      <form @submit.prevent="addPost">
        <div class="form-group">
          <label for="thread_content">Content:</label>
          <textarea
            id="thread_content"
            class="form-input"
            name="content"
            rows="8"
            cols="140"
            v-model="newPostTextRf"
          />
        </div>
        <div class="btn-group">
          <button class="btn btn-ghost">Cancel</button>
          <button class="btn btn-blue" type="submit" name="Publish">
            Publish
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
