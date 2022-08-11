<script setup lang="ts">
import { ThreadVM } from "../models/ThreadVM";
import { useMainStore } from "../store";

defineProps<{
  threads: Array<ThreadVM>;
}>();

const store = useMainStore();

function userById(uId: string) {
  return store.users.find(({ id }) => id === uId);
}
</script>

<template>
  <div class="col-full">
    <div class="thread-list">
      <h2 class="list-title">Threads</h2>

      <div
        class="thread"
        v-for="{ id, title, userId, publishedAt, posts: { length } } of threads"
        :key="id"
      >
        <div>
          <p>
            <router-link :to="{ name: `ThreadShow`, params: { id } }">
              {{ title }}
            </router-link>
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

<style scoped></style>
