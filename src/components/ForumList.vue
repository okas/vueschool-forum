<script setup lang="ts">
defineProps({
  forums: {
    type: Array<{
      id: string;
      name: string;
      description: string;
      threads?: Array<string> | undefined;
    }>,
    required: true,
  },
});

function forumThreadsWord(length: number) {
  return length === 1 ? "thread" : length ? "threads" : "no threads";
}
</script>

<template>
  <div class="col-full">
    <div class="forum-list">
      <h2 class="list-title">
        <a href="#">Forums</a>
      </h2>

      <div
        class="forum-listing"
        v-for="{ id, name, description, threads: { length } = [] } in forums"
        :key="id"
      >
        <div class="forum-details">
          <router-link
            class="text-xlarge"
            :to="{ name: 'Forum', params: { id } }"
          >
            {{ name }}
          </router-link>
          <p v-text="description" />
        </div>

        <div class="threads-count">
          <p>
            <span class="count" v-text="length" v-if="length" />
            <span v-text="forumThreadsWord(length)" />
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
    </div>
  </div>
</template>

<style scoped></style>
