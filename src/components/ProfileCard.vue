<script setup lang="ts">
import { reactive } from "vue";
import { IAuthUser } from "../types/IAuthUser";

const props = defineProps<{
  authUser: IAuthUser;
}>();

const { name, avatar, username, bio, website, postsCount, threadsCount } =
  reactive(props.authUser);
</script>

<template>
  <div class="profile-card">
    <p class="text-center">
      <img
        :src="avatar"
        class="avatar-xlarge"
        :alt="`${name} profile picture`"
      />
    </p>

    <h1 class="title" v-text="username" />

    <p class="text-lead" v-text="name" />

    <p class="text-justify" v-text="!bio ? 'No bio specified' : bio" />

    <span class="online" v-text="`${username} is online`" />

    <div class="stats">
      <span v-text="`${postsCount} posts`" />
      <span v-text="`${threadsCount} threads`" />
    </div>

    <hr />

    <p v-if="website" class="text-large text-center">
      <i class="fa fa-globe"></i> <a :href="website" v-text="website" />
    </p>
  </div>
</template>

<style scoped></style>
