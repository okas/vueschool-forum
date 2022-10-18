<script setup lang="ts">
import { getCountPhrase, getProfileTitle } from "@/utils/misc";
import { computed } from "vue";

export interface IThreadListItem {
  title: string;
  threadId: string;
  userName: string;
  publishedAt: number;
  repliesCount: number;
  userAvatar?: string;
  tag?: string;
}

const props = withDefaults(defineProps<IThreadListItem>(), {
  userAvatar: undefined,
  tag: "li",
});

const repliesCountPhrase = computed(() => getCountPhrase(props.repliesCount, "reply"));

const profileTitlePhrase = computed(() => getProfileTitle(props.userName));
</script>

<template>
  <component :is="tag" class="thread">
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
  </component>
</template>
