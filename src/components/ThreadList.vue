<script setup lang="ts">
import { computed } from "vue";
import { ThreadVM } from "../models/ThreadVM";
import { useMainStore } from "../store";

const props = defineProps<{
  threads: Array<ThreadVM>;
}>();

const { getUserByIdFn } = useMainStore();

const renderData = computed(() =>
  props.threads.map(
    ({ id, title, userId, publishedAt, posts: { length: postsCount } }) => {
      const { name: userName, avatar: userAvatar } = getUserByIdFn(userId);

      return {
        threadId: id,
        title,
        publishedAt,
        postsCount,
        userName,
        userAvatar,
      };
    }
  )
);

function countPhrase(count: number) {
  return `${count}${
    count === 1 ? " reply" : count ? " replies" : "no replies"
  }`;
}
</script>

<template>
  <div class="col-full">
    <div class="thread-list">
      <h2 class="list-title">Threads</h2>

      <div
        v-for="{
          threadId,
          title,
          publishedAt,
          postsCount,
          userName,
          userAvatar,
        } of renderData"
        :key="threadId"
        class="thread"
      >
        <div>
          <p>
            <router-link :to="{ name: `ThreadShow`, params: { threadId } }">
              {{ title }}
            </router-link>
          </p>
          <p class="text-faded text-xsmall">
            By <a href="#" v-text="userName" />,
            <app-date :timestamp="publishedAt" />.
            <!-- By <a href="profile.html" v-text="userById(userId).name" />, {{ publishedAt }}. -->
          </p>
        </div>

        <div class="activity">
          <p class="replies-count" v-text="countPhrase(postsCount)" />

          <img class="avatar-medium" :src="userAvatar" alt="" />

          <div>
            <p class="text-xsmall">
              <a href="#" v-text="userName" />
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
