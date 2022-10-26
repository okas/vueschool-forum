<script setup lang="ts">
import PostList from "@/components/PostList.vue";
import ProfileCard from "@/components/ProfileCard.vue";
import ProfileCardEditor from "@/components/ProfileCardEditor.vue";
import useNotifications from "@/composables/useNotifications";
import type { PostVm } from "@/models/PostVm";
import { useCommonStore } from "@/stores/common-store";
import { usePostStore } from "@/stores/post-store";
import { useUserStore } from "@/stores/user-store";
import type { UserVmEditForInput } from "@/types/userVm-types";
import { ok } from "@/utils/assert-helpers";
import { useAsyncState } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, onUpdated, ref } from "vue";
import { useRouter, type RouteLocationRaw } from "vue-router";

const pageSize = 10;
const routeToReturn: RouteLocationRaw = { name: "Profile" };

// TODO: refactor activity to component and migrate page to separate page

defineProps<{
  edit?: boolean;
}>();

const commonStore = useCommonStore();
const userStore = useUserStore();
const postStore = usePostStore();
const router = useRouter();

const { addNotification } = useNotifications();

const { getAuthUser } = storeToRefs(userStore);

const { isReady } = useAsyncState(async () => {
  await fetchUserPosts();
  commonStore.setReady();
}, undefined);

let tempEditorContent = ref<UserVmEditForInput | undefined>();

const hasDirtyForm = ref(false);
const isEmailChanged = ref(false);
const isReAuthNeeded = ref(false);
const isReAuthVisible = ref(false);
const isReAuthenticating = ref(false);

const lastPostsDesc = computed<Array<PostVm>>(() =>
  [...(getAuthUser.value?.posts ?? [])].sort(
    ({ publishedAt: a }, { publishedAt: b }) => b - a
  )
);

const canReveal = computed(() => isReady.value && getAuthUser.value);

const personalizedRecentActivity = computed(
  () => `${getAuthUser.value?.username}'s recent activity`
);

const hasNoMorePosts = computed(
  () => getAuthUser.value?.posts.length === getAuthUser.value?.postsCount
);

onUpdated(() => {
  if (getAuthUser.value) {
    commonStore.setReady();
  } else {
    goToHome();
  }
});

function fetchUserPosts(): Promise<void> {
  return postStore.fetchAllUserPosts(
    pageSize,
    getAuthUser.value?.posts.at(-1)?.id
  );
}

async function goToHome() {
  await router.push({ name: "Home" });
}

async function save(dto: UserVmEditForInput) {
  commonStore.setLoading();

  if (isEmailChanged.value) {
    await initiateReAuth(dto);
  } else {
    await saveUserData(dto);
  }
}

async function saveUserData(dto: UserVmEditForInput) {
  try {
    await userStore.editUser(dto);
  } catch (err) {
    console.error(err);
    const errStr = String(err);

    addNotification(
      {
        message: errStr.includes("storage/unauthorized")
          ? "Avatar file cannot be uploaded (permission problem)."
          : errStr,
        type: "error",
      },
      5000
    );

    commonStore.setLoading(false);

    return;
  }

  addNotification({ message: "User successfully updated" }, 2500);

  router.push(routeToReturn);
}

function cancel() {
  router.push(routeToReturn);
}

async function initiateReAuth(dto: UserVmEditForInput) {
  tempEditorContent.value = dto;
  isReAuthNeeded.value = true;
  isReAuthVisible.value = true;
}

function setReAuthingStatus(state = true) {
  isReAuthenticating.value = state;
  commonStore.setLoading();
}

async function doReAuth(email: string, password: string) {
  setReAuthingStatus();

  try {
    await userStore.reAuthenticate(email, password);
  } catch (err) {
    console.error(err);
    const errStr = String(err);

    addNotification(
      {
        message: errStr.includes("auth/user-mismatch")
          ? "Incorrect username or password."
          : errStr,
        type: "error",
      },
      5000
    );

    tempEditorContent.value = undefined;

    return;
  } finally {
    reAuthEnded();
  }

  ok(
    tempEditorContent.value,
    "Developer error: on reauth, user data is missing."
  );

  await saveUserData(tempEditorContent.value);
}

function reAuthCancelled() {
  tempEditorContent.value = undefined;
  hasDirtyForm.value = true;
  reAuthEnded();
}

function reAuthEnded() {
  isReAuthVisible.value = false;
  setReAuthingStatus(false);
  commonStore.setLoading(false);
}
</script>

<template>
  <div v-if="canReveal" class="flex-grid">
    <div class="col-3 push-top">
      <profile-card v-if="!edit" :auth-user="getAuthUser!" />

      <profile-card-editor
        v-else
        v-model:is-dirty="hasDirtyForm"
        v-model:is-email-changed="isEmailChanged"
        :user="getAuthUser!"
        @save="save"
        @cancel="cancel"
      />
    </div>

    <div class="col-7 push-top">
      <div class="profile-header">
        <span class="text-lead" v-text="personalizedRecentActivity" />
      </div>

      <hr />

      <div class="activity-list">
        <post-list :posts="lastPostsDesc" />
      </div>

      <app-infinite-scroll :done="hasNoMorePosts" @reached-end="fetchUserPosts" />
    </div>
  </div>

  <profile-card-editor-reauth-modal
    :is-waiting="isReAuthenticating"
    :reveal-condition="isReAuthVisible"
    @cancel="reAuthCancelled"
    @submit="doReAuth"
  />

  <app-nav-confirmation-modal v-if="edit" :reveal-condition="hasDirtyForm" />
</template>
