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

const newPassword = ref<string | undefined>();

const hasDirtyForm = ref(false);
const isCredentialChanged = ref(false);
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

async function save(dto: UserVmEditForInput, password?: string) {
  commonStore.setLoading();

  if (isCredentialChanged.value) {
    newPassword.value = password;
    await initiateReAuth(dto);
  } else {
    await saveUserData(dto);
  }
}

async function saveUserData(dto: UserVmEditForInput, password?: string) {
  try {
    await userStore.editUser(dto, undefined, password);
  } catch (err) {
    console.error(err);
    notifyUserUpdateError(err as unknown as Error);

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
    notifyReAuthError(err as unknown as Error);

    tempEditorContent.value = undefined;

    return;
  } finally {
    reAuthEnded();
  }

  ok(
    tempEditorContent.value,
    "Developer error: on reauth, user data is missing."
  );

  await saveUserData(tempEditorContent.value, newPassword.value);
}

function notifyReAuthError(err: Error) {
  const errStr = String(err);

  const credentialMismatch: string | undefined = `${
    errStr.includes("auth/user-mismatch")
      ? "email"
      : errStr.includes("auth/wrong-password")
      ? "password"
      : undefined
  }`;

  addNotification(
    {
      message: credentialMismatch ? `Incorrect ${credentialMismatch}` : errStr,
      type: "error",
    },
    5000
  );
}

function notifyUserUpdateError(err: Error) {
  const errStr = String(err);

  const weakMarker = "auth/weak-password";
  const passwdPolicy = errStr.includes(weakMarker)
    ? errStr
        .split(":")[2]
        .slice(0, -weakMarker.length - 3) // 3 compensates parentheses and '.'
        .trim()
    : undefined;

  addNotification(
    {
      message: passwdPolicy
        ? passwdPolicy
        : errStr.includes("storage/unauthorized")
        ? "Avatar file cannot be uploaded (permission problem)."
        : errStr,
      type: "error",
    },
    5000
  );
}

function reAuthCancelled() {
  tempEditorContent.value = undefined;
  newPassword.value = undefined;
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
        v-model:is-credential-changed="isCredentialChanged"
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
    v-if="edit"
    :is-waiting="isReAuthenticating"
    :reveal-condition="isReAuthVisible"
    @cancel="reAuthCancelled"
    @submit="doReAuth"
  />

  <app-nav-confirmation-modal v-if="edit" :reveal-condition="hasDirtyForm" />
</template>
