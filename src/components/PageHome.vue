<template>
  <div>Hello from Page Home</div>
  <div v-for="t in threads" :key="t.id">
    <h2 v-text="t.title" />
    <div v-for="postId in t.posts" :key="postId">
      <p v-text="userById(postById(postId).userId).name" />
      <p v-text="postById(postId).text" />
    </div>
  </div>
</template>

<script setup>
import { threads, posts, users } from "../data.json";

function postById(pId) {
  return posts.find(({ id }) => id === pId);
}

function userById(uId) {
  return users.find(({ id }) => id === uId);
}
</script>

<style scoped></style>
