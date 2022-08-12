<script setup lang="ts">
import { computed } from "vue";
import PostList from "../components/PostList.vue";
import ProfileCard from "../components/ProfileCard.vue";
import { useMainStore } from "../store";
import {
  diffFromUnix,
  formatMonthYearFromUnix,
} from "../utils/dateTimeDiffFormat";

const store = useMainStore();

const { name, registeredAt, lastVisitAt, posts } = store.authUser;

const memberSince = computed(() => formatMonthYearFromUnix(registeredAt));

const lasVisited = computed(() => diffFromUnix(lastVisitAt));
</script>

<template>
  <div class="flex-grid">
    <div class="col-3 push-top">
      <profile-card :auth-user="store.authUser" />

      <p class="text-xsmall text-faded text-center">
        <span v-text="`Member since ${memberSince}, `" />
        <span v-text="`last visited ${lasVisited}`" />
      </p>

      <div class="text-center">
        <hr />
        <a href="edit-profile.html" class="btn-green btn-small">Edit Profile</a>
      </div>
    </div>

    <div class="col-7 push-top">
      <div class="profile-header">
        <span class="text-lead">{{ name }}'s recent activity </span>
        <a href="#">See only started threads?</a>
      </div>

      <hr />

      <post-list :posts="posts" />
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
