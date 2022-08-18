<script setup lang="ts">
import { storeToRefs } from "pinia";
import PostList from "../components/PostList.vue";
import ProfileCard from "../components/ProfileCard.vue";
import ProfileCardEditor from "../components/ProfileCardEditor.vue";
import { useMainStore } from "../stores/main-store";

// TODO: refactor activity to component and migrate page to separate page

defineProps<{
  edit?: boolean;
}>();

const { getAuthUser } = storeToRefs(useMainStore());
</script>

<template>
  <div class="flex-grid">
    <div class="col-3 push-top">
      <profile-card v-if="!edit" :auth-user="getAuthUser" />
      <profile-card-editor v-else :user="getAuthUser" />
    </div>

    <div class="col-7 push-top">
      <div class="profile-header">
        <span class="text-lead"
          >{{ getAuthUser.username }}'s recent activity
        </span>
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
</template>

<style scoped></style>
