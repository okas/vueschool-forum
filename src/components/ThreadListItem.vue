<script setup lang="ts">
import { computed } from "vue";
import { getCountPhrase, getProfileTitle } from "../utils/misc";

const props = defineProps<{
  title: string;
  threadId: string;
  userName: string;
  publishedAt: number;
  repliesCount: number;
  userAvatar?: string;
}>();

const repliesCountPhrase = computed(() => getCountPhrase(props.repliesCount, "reply"));

const profileTitlePhrase = computed(() => getProfileTitle(props.userName));
</script>

<template>
  <div class="thread">
    <div>
      <p>
        <router-link :to="{ name: `Thread`, params: { threadId } }">
          {{ title }}
        </router-link>
      </p>
      <p class="text-faded text-xsmall">
        By <a href="#" v-text="userName" />, <app-date :timestamp="publishedAt" />.
      </p>
    </div>

    <div class="activity">
      <p class="replies-count" v-text="repliesCountPhrase" />

      <app-avatar-img
        class="avatar-medium"
        :src="userAvatar"
        :title="profileTitlePhrase"
      />

      <div>
        <p class="text-xsmall">
          <a href="#" v-text="userName" />
        </p>
        <p class="text-xsmall text-faded">
          <app-date :timestamp="publishedAt" />
        </p>
      </div>
    </div>
  </div>
</template>
