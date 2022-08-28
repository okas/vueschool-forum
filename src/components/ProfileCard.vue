<script setup lang="ts">
import { computed } from "vue";
import { UserVMWithActivity } from "../types/userVm-types";
import {
  diffFromUnix,
  formatMonthYearFromUnix,
} from "../utils/dateTimeDiffFormat";
import { getCountPhrase } from "../utils/misc";

const props = defineProps<{
  authUser: UserVMWithActivity;
}>();

const memberSince = computed(() =>
  formatMonthYearFromUnix(props.authUser.registeredAt)
);

const lasVisited = computed(() => diffFromUnix(props.authUser.lastVisitAt));
</script>

<template>
  <div class="profile-card">
    <p class="text-center">
      <img
        :src="authUser.avatar"
        class="avatar-xlarge"
        :title="`${authUser.name}'s profile picture`"
      />
    </p>

    <h1 class="title" v-text="authUser.username" />

    <p class="text-lead" v-text="authUser.name" />

    <p
      class="text-justify"
      v-text="!authUser.bio ? 'No bio specified' : authUser.bio"
    />

    <span class="online" v-text="`${authUser.username} is online`" />

    <div class="stats">
      <span v-text="getCountPhrase(authUser.postsCount ?? 0, 'post')" />
      <span v-text="getCountPhrase(authUser.threadsCount ?? 0, 'thread')" />
    </div>

    <hr />

    <p v-if="authUser.website" class="text-large text-center">
      <i class="fa fa-globe"></i>
      <a :href="authUser.website" v-text="authUser.website" />
    </p>
  </div>

  <p class="text-xsmall text-faded text-center">
    <span v-text="`Member since ${memberSince}, `" />
    <span v-text="`last visited ${lasVisited}`" />
  </p>

  <div class="text-center">
    <hr />
    <router-link :to="{ name: 'ProfileEdit' }" class="btn-green btn-small">
      Edit Profile
    </router-link>
  </div>
</template>

<style scoped></style>
