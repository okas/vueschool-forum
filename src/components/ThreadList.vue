<script setup lang="ts">
import { computed } from "vue";
import { useMainStore } from "../store";
import { ThreadVMWithMeta } from "../types/ThreadVMTypes";

const props = defineProps<{
  threads: Array<ThreadVMWithMeta>;
}>();

const { getUserByIdFn } = useMainStore();

const renderData = computed(() =>
  props.threads.map(({ id, title, userId, publishedAt, repliesCount }) => {
    const { name: userName, avatar: userAvatar } = getUserByIdFn(userId);

    return {
      threadId: id,
      title,
      publishedAt,
      repliesCount,
      userName,
      userAvatar,
    };
  })
);

function countPhrase(count: number) {
  return `${
    count === 1 ? `${count} reply` : count ? `${count} replies` : "no replies"
  }`;
}
</script>

<template>
  <div class="thread-list">
    <h2 class="list-title">Threads</h2>

    <div
      v-for="{
        threadId,
        title,
        publishedAt,
        repliesCount,
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
        <p class="replies-count" v-text="countPhrase(repliesCount)" />

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
</template>

<style scoped></style>
