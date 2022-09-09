<script setup lang="ts">
import { useAsyncState, useConfirmDialog } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onUpdated, provide, ref } from "vue";
import { onBeforeRouteLeave, RouteLocationRaw, useRouter } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import PostList from "../components/PostList.vue";
import ProfileCard from "../components/ProfileCard.vue";
import ProfileCardEditor from "../components/ProfileCardEditor.vue";
import { useMainStore } from "../stores/main-store";
import { UserVmEditForInput } from "../types/userVm-types";

// TODO: refactor activity to component and migrate page to separate page

const props = defineProps<{
  edit?: boolean;
}>();

const store = useMainStore();
const router = useRouter();

const { isRevealed, reveal, confirm } = useConfirmDialog();

const { getAuthUser } = storeToRefs(store);

const { isReady } = useAsyncState(async () => {
  await store.fetchAllUserPosts();
  store._isReady = true;
}, undefined);

const hasDirtyForm = ref<boolean>(false);

const routeToReturn = { name: "Profile" } as RouteLocationRaw;

provide(confirmInjectKey, confirm);

onUpdated(() => {
  if (getAuthUser.value) {
    store._isReady = true;
  } else {
    goToHome();
  }
});

onBeforeRouteLeave(async () => {
  if (props.edit && hasDirtyForm.value) {
    return (await reveal()).data;
  }
});

async function goToHome() {
  await router.push({ name: "Home" });
}

async function save(dto: UserVmEditForInput) {
  await store.editUser(dto);

  router.push(routeToReturn);
}

function cancel() {
  router.push(routeToReturn);
}
</script>

<template>
  <div v-if="isReady" class="flex-grid">
    <div class="col-3 push-top">
      <profile-card v-if="!edit" :auth-user="getAuthUser" />
      <profile-card-editor
        v-else
        v-model:is-dirty="hasDirtyForm"
        :user="getAuthUser"
        @save="save"
        @cancel="cancel"
      />
    </div>

    <div class="col-7 push-top">
      <div class="profile-header">
        <span class="text-lead"
          >{{ getAuthUser.username }}'s recent activity</span
        >
        <a href="#">See only started threads?</a>
      </div>

      <hr />

      <post-list :posts="getAuthUser.posts" />
      <!-- <div class="activity-list">
        <div class="activity">
          <div class="activity-header">
            <img
              src="https://i.imgur.com/OqlZN48.jpg"
              alt=""
              class="hide-mobile avatar-small"
            />
            <p class="title">
              How can I chop onions without crying?
              <span>Joker started a topic in Cooking</span>
            </p>
          </div>

          <div class="post-content">
            <div>
              <p>
                I absolutely love onions, but they hurt my eyes! Is there a
                way where you can chop onions without crying?
              </p>
            </div>
          </div>

          <div class="thread-details">
            <span>4 minutes ago</span>
            <span>1 comments</span>
          </div>
        </div>
      </div> -->
    </div>
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
