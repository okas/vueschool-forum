<script setup lang="ts">
import { ForumVM } from "../models/ForumVM";

defineProps<{
  forums: Array<ForumVM>;
}>();

function countPhrase(length: number) {
  return length === 1 ? "thread" : length ? "threads" : "no threads";
}
</script>

<template>
  <div
    v-for="{
      id: forumId,
      name,
      description,
      threads: { length } = [],
    } of forums"
    :key="forumId"
    class="forum-listing"
  >
    <div class="forum-details">
      <router-link
        class="text-xlarge"
        :to="{
          name: 'Forum',
          params: { forumId },
        }"
      >
        {{ name }}
      </router-link>
      <p v-text="description" />
    </div>

    <div class="threads-count">
      <p>
        <span v-if="length" class="count" v-text="length" />
        <span v-text="countPhrase(length)" />
      </p>
    </div>

    <div class="last-thread">
      <!-- <img
          class="avatar"
          src="https://pbs.twimg.com/profile_images/719242842598699008/Nu43rQz1_400x400.jpg"
          alt=""
        />
        <div class="last-thread-details">
          <a href="thread.html">Post Reactions</a>
          <p class="text-xsmall">
            By <a href="profile.html">Rolf Haug</a>, a month ago
          </p>
        </div> -->
    </div>
  </div>
</template>
