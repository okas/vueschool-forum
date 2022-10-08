<script setup lang="ts">
import { computedAsync, useFileDialog, UseFileDialogOptions } from "@vueuse/core";
import { computed, watch } from "vue";
import AppSpinner from "../components/AppSpinner.vue";
import useNotifications, { INote } from "../composables/useNotifications";
import { useCommonStore } from "../stores/common-store";
import { useUserStore } from "../stores/user-store";
import { UserVMWithActivity } from "../types/userVm-types";
import { diffFromUnix, formatMonthYearFromUnix } from "../utils/dateTimeDiffFormat";
import { getCountPhrase } from "../utils/misc";

const fileDialogOptions: UseFileDialogOptions = {
  multiple: false,
  accept: "image/*",
};

const props = defineProps<{
  authUser: UserVMWithActivity;
}>();

const commonStore = useCommonStore();
const userStore = useUserStore();

const { files, open, reset } = useFileDialog();

const { addNotification } = useNotifications();

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

watch(singleFile, async (updatedVal) => {
  if (!updatedVal) {
    return;
  }

  commonStore.setLoading(true);

  let note: INote;
  let timeoutMs: number;

  try {
    await userStore.updateAvatar({
      id: props.authUser.id,
      avatarFile: updatedVal,
    });
    note = { message: "New avatar stored" };
    timeoutMs = 2500;
  } catch (err) {
    note = { message: "Avatar storing error", type: "error" };
    timeoutMs = 5000;
  } finally {
    addNotification(note, timeoutMs);
    commonStore.setLoading(false);
    reset();
  }
});

function openDialog() {
  open(fileDialogOptions);
}
</script>

<template>
  <div class="profile-card">
    <div class="form-group" @click.prevent="openDialog">
      <div class="avatar-edit">
        <img
          :src="avatarToShow"
          class="avatar-xlarge img-update"
          :title="`${authUser.name}'s profile picture`"
        />
        <div class="avatar-upload-overlay">
          <fa v-if="!commonStore.isLoading" icon="camera" size="3x" inverse />
          <app-spinner v-else inverse />
        </div>
      </div>
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
