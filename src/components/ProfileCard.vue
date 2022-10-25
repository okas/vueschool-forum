<script setup lang="ts">
import AppAvatarFilePicker from "@/components/AppAvatarFilePicker.vue";
import useNotifications, { type INote } from "@/composables/useNotifications";
import { useCommonStore } from "@/stores/common-store";
import { useUserStore } from "@/stores/user-store";
import type { IFileInfo } from "@/types/avatar-utility-types";
import type { UserVMWithActivity } from "@/types/userVm-types";
import {
  diffFromUnix,
  formatMonthYearFromUnix,
} from "@/utils/dateTimeDiffFormat";
import { getCountPhrase, getProfileTitle } from "@/utils/misc";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  authUser: UserVMWithActivity;
}>();

const commonStore = useCommonStore();
const userStore = useUserStore();

const { addNotification } = useNotifications();

const userSelectedAvatarFileData = ref<IFileInfo | undefined>();

const isLoading = ref(false);

const memberSince = computed(() =>
  formatMonthYearFromUnix(props.authUser.registeredAt)
);

const avatarTitle = computed(() => getProfileTitle(props.authUser.username));

const avatarToShow = computed<string | undefined>(
  () =>
    userSelectedAvatarFileData.value?.objUrl ??
    props.authUser.avatar ??
    undefined
);

const lasVisited = computed(() => diffFromUnix(props.authUser.lastVisitAt));

watch(userSelectedAvatarFileData, async (fileInfo) => {
  if (!fileInfo?.file) {
    return;
  }

  setLoadingState();

  let note: INote = { message: "New avatar stored" };
  let timeoutMs = 2500;

  try {
    await userStore.updateAvatar({
      id: props.authUser.id,
      avatarFile: fileInfo.file,
    });
  } catch {
    note = { message: "Avatar storing error", type: "error" };
    timeoutMs = 5000;
  } finally {
    finalizeUpdate(note, timeoutMs);
  }
});

function finalizeUpdate(note: INote, timeoutMs: number) {
  addNotification(note, timeoutMs);
  setLoadingState(false);
  userSelectedAvatarFileData.value = undefined;
}

function setLoadingState(state = true) {
  commonStore.setLoading(state);
  isLoading.value = state;
}

function storeFileDateToState(dto: IFileInfo) {
  userSelectedAvatarFileData.value = dto;
}
</script>

<template>
  <div class="profile-card">
    <div class="form-group">
      <div class="avatar-edit">
        <app-avatar-file-picker
          :title="avatarTitle"
          :avatar-src="avatarToShow"
          @img-loaded="commonStore.setLoading(false)"
          @file-picked="storeFileDateToState"
        >
          <fa v-if="!isLoading" icon="camera" size="3x" inverse />

          <app-spinner v-else inverse />
        </app-avatar-file-picker>
      </div>
    </div>

    <h1 class="title" v-text="authUser.username" />

    <p class="text-lead" v-text="authUser.name" />

    <p class="text-center" v-text="authUser.bio ?? 'No bio specified'" />

    <p>
      <fa style="color: #57ad8d" icon="circle-user" />
      <span v-text="`&nbsp;${authUser.username} is online`" />
    </p>

    <div class="stats">
      <span v-text="getCountPhrase(authUser.postsCount ?? 0, 'post')" />
      <span v-text="getCountPhrase(authUser.threadsCount ?? 0, 'thread')" />
    </div>

    <hr />

    <p v-if="authUser.email" class="text-large text-center">
      <fa icon="paper-plane" />
      <a :href="`mailto:${authUser.email}`" v-text="`&nbsp;${authUser.email}`" />
    </p>

    <p v-if="authUser.website" class="text-large text-center">
      <fa icon="globe" />
      <a :href="authUser.website" v-text="`&nbsp;${authUser.website}`" />
    </p>

    <p v-if="authUser.twitter" class="text-large text-center">
      <fa :icon="['fab', 'twitter']" />
      <a
        :href="`https://twitter.com/${authUser.twitter}`"
        v-text="`&nbsp;${authUser.twitter}`"
      />
    </p>

    <p v-if="authUser.location" class="text-large text-center">
      <fa icon="location-dot" />
      <span v-text="`&nbsp;${authUser.location}`" />
    </p>
  </div>

  <p class="text-xsmall text-faded text-center text-warning" style="color: red">
    <span v-text="`Member since ${memberSince}, `" />
    <span v-text="`last visited ${lasVisited}`" />
  </p>

  <hr />

  <div class="text-center">
    <router-link :to="{ name: 'ProfileEdit' }" class="btn-green btn-small">
      Edit Profile
    </router-link>
  </div>
</template>
