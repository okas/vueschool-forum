<script setup lang="ts">
import { IAuthUser } from "../types/IAuthUser";

defineProps<{
  authUser: IAuthUser;
}>();
</script>

<template>
  <div class="profile-card">
    <p class="text-center">
      <img
        :src="authUser.avatar"
        class="avatar-xlarge"
        :alt="`${authUser.name} profile picture`"
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
      <span v-text="`${authUser.postsCount} posts`" />
      <span v-text="`${authUser.threadsCount} threads`" />
    </div>

    <hr />

    <p v-if="authUser.website" class="text-large text-center">
      <i class="fa fa-globe"></i>
      <a :href="authUser.website" v-text="authUser.website" />
    </p>
  </div>
</template>

<style scoped></style>
