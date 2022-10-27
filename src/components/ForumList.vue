<script setup lang="ts">
import type { ForumVM } from "@/models/ForumVM";
import type { UserVM } from "@/models/UserVM";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import { useUserStore } from "@/stores/user-store";
import { getProfileTitle, truncate } from "@/utils/misc";
import { computed } from "vue";

const props = defineProps<{
  forums: Array<ForumVM>;
}>();

const userStore = useUserStore();
const postStore = usePostStore();
const threadStore = useThreadStore();

const renderData = computed(() =>
  props.forums.map(
    ({
      id: forumId,
      name,
      description,
      threads: { length: threadsCount } = [],
      lastPostId,
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { userId, publishedAt, threadId } = postStore.items.find(
        ({ id }) => id === lastPostId
      )!;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { title: threadTitle } = threadStore.items.find(({ id }) => id === threadId)!;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { name: userFullName, username, avatar }: UserVM = userStore.items.find(
        ({ id }) => id === userId
      )!;

      return {
        forumId,
        name,
        description,
        threadsCount,
        username,
        threadId,
        threadTitle,
        lastPostId,
        avatar: avatar ?? undefined,
        publishedAt: Number(publishedAt),
        userFullName,
      };
    }
  )
);

function countPhrase(length: number) {
  return length === 1 ? "thread" : length ? "threads" : "no threads";
}
</script>

<template>
  <div
    v-for="{
      forumId,
      name,
      description,
      threadsCount,
      username,
      threadId,
      threadTitle,
      lastPostId,
      avatar,
      publishedAt,
      userFullName,
    } of renderData"
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
        <span v-if="threadsCount" class="count" v-text="threadsCount" />
        <span v-text="countPhrase(threadsCount)" />
      </p>
    </div>

    <div class="last-thread">
      <app-avatar-img
        :src="avatar"
        class="avatar-forum-list"
        :title="getProfileTitle(userFullName)"
      />
      <div class="last-thread-details">
        <router-link
          :to="{ name: 'Thread', params: { threadId }, hash: `#${lastPostId}` }"
          :title="threadTitle"
        >
          {{ truncate(threadTitle, 30) }}
        </router-link>
        <p class="text-xsmall">
          By <a href="#" :title="userFullName">{{ username }}</a
          >, <app-date :time="publishedAt" />
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-forum-list {
  transform: scale(1.2);
}
</style>
