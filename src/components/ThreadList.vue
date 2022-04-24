<template>
  <div class="col-full">
    <div class="thread-list">
      <h2 class="list-title">Threads</h2>

      <div
        class="thread"
        v-for="{ id, title, userId, publishedAt, posts: { length } } in threads"
        :key="id"
      >
        <div>
          <p>
            <a href="#" v-text="title" />
            <!-- <a href="thread.html" v-text="title" /> -->
          </p>
          <p class="text-faded text-xsmall">
            By <a href="#" v-text="userById(userId).name" />, {{ publishedAt }}.
            <!-- By <a href="profile.html" v-text="userById(userId).name" />, {{ publishedAt }}. -->
          </p>
        </div>

        <div class="activity">
          <p class="replies-count">{{ length }} replies</p>

          <img class="avatar-medium" :src="userById(userId).avatar" alt="" />

          <div>
            <p class="text-xsmall">
              <a href="#" v-text="userById(userId).name" />
              <!-- <a href="profile.html" v-text="userById(userId)" /> -->
            </p>
            <p class="text-xsmall text-faded" v-text="publishedAt" />
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="pagination">
      <button class="btn-circle" disabled="">
        <i class="fa fa-angle-left"></i>
      </button>
      1 of 3
      <button class="btn-circle"><i class="fa fa-angle-right"></i></button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { threads, users } from "../data.json";

function userById(uId) {
  return users.find(({ id }) => id === uId);
}
</script>

<style scoped></style>
