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
            <router-link
              :to="{ name: `ThreadShow`, params: { id } }"
              v-text="title"
            />
          </p>
          <p class="text-faded text-xsmall">
            By <a href="#" v-text="userById(userId).name" />,
            <app-date :timestamp="publishedAt" />.
            <!-- By <a href="profile.html" v-text="userById(userId).name" />, {{ publishedAt }}. -->
          </p>
        </div>

        <div class="activity">
          <p class="replies-count">
            {{ length }}
            {{ length > 1 || length === 0 ? "replies" : "reply" }}
          </p>

          <img class="avatar-medium" :src="userById(userId).avatar" alt="" />

          <div>
            <p class="text-xsmall">
              <a href="#" v-text="userById(userId).name" />
              <!-- <a href="profile.html" v-text="userById(userId)" /> -->
            </p>
            <p class="text-xsmall text-faded">
              <app-date :timestamp="publishedAt" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="pagination"></div>
      <button class="btn-circle" disabled="">
        <i class="fa fa-angle-left"></i>
      </button>
      1 of 3
      <button class="btn-circle"><i class="fa fa-angle-right"></i></button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import AppDate from "./AppDate.vue";
import { users } from "../data.json";

defineProps({
  threads: {
    type: Array,
    required: true,
  },
});

function userById(uId: string) {
  return users.find(({ id }) => id === uId);
}
</script>

<style scoped></style>
