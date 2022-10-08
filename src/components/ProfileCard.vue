<script setup lang="ts">
import { computedAsync, useFileDialog, UseFileDialogOptions } from "@vueuse/core";
import { computed, watch } from "vue";
import { UserVMEditAvatarFile, UserVMWithActivity } from "../types/userVm-types";
import { diffFromUnix, formatMonthYearFromUnix } from "../utils/dateTimeDiffFormat";
import { getCountPhrase } from "../utils/misc";

const fileDialogOptions: UseFileDialogOptions = {
  multiple: false,
  accept: "image/*",
};

const props = defineProps<{
  authUser: UserVMWithActivity;
}>();

const emits = defineEmits<{
  (e: "updateAvatarFile", dto: UserVMEditAvatarFile): void;
}>();

const { files, open, reset } = useFileDialog();

const singleFile = computed(() => files.value?.item(0));

const memberSince = computed(() => formatMonthYearFromUnix(props.authUser.registeredAt));

const avatarPreviewImgDataUrl = computedAsync<string>(
  async () => {
    return singleFile.value
      ? new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = ({ target: { result } }) => resolve(result.toString());
          reader.readAsDataURL(singleFile.value);
        })
      : undefined;
  },
  undefined,
  { lazy: true }
);

const avatarToShow = computed(
  () => avatarPreviewImgDataUrl.value ?? props.authUser.avatar
);

const lasVisited = computed(() => diffFromUnix(props.authUser.lastVisitAt));

watch(
  singleFile,
  (updatedVal) =>
    updatedVal &&
    emits("updateAvatarFile", {
      id: props.authUser.id,
      avatarFile: updatedVal,
    })
);

watch(() => props.authUser.avatar, reset);

function openDialog() {
  open(fileDialogOptions);
}
</script>

<template>
  <div class="profile-card">
    <div class="form-group" @click="openDialog">
      <img
        :src="avatarToShow"
        class="avatar-xlarge"
        :title="`${authUser.name}'s profile picture`"
      />
    </div>

    <h1 class="title" v-text="authUser.username" />

    <p class="text-lead" v-text="authUser.name" />

    <p class="text-justify" v-text="authUser.bio ?? 'No bio specified'" />

    <p>
      <fa style="color: #57ad8d" icon="circle-user" />&nbsp;
      <span v-text="`${authUser.username} is online`" />
    </p>

    <div class="stats">
      <span v-text="getCountPhrase(authUser.postsCount ?? 0, 'post')" />
      <span v-text="getCountPhrase(authUser.threadsCount ?? 0, 'thread')" />
    </div>

    <hr />

    <p v-if="authUser.email" class="text-large text-center">
      <fa icon="paper-plane" />&nbsp;
      <a :href="`mailto:${authUser.email}`" v-text="authUser.email" />
    </p>

    <p v-if="authUser.website" class="text-large text-center">
      <fa icon="globe" />&nbsp;
      <a :href="authUser.website" v-text="authUser.website" />
    </p>

    <p v-if="authUser.twitter" class="text-large text-center">
      <fa :icon="['fab', 'twitter']" />&nbsp;
      <a :href="`https://twitter.com/${authUser.twitter}`" v-text="authUser.twitter" />
    </p>

    <p v-if="authUser.location" class="text-large text-center">
      <fa icon="location-dot" />&nbsp;
      <span v-text="authUser.location" />
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
