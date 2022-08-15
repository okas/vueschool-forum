<script setup lang="ts">
import { reactive, toRaw } from "vue";
import { useRouter } from "vue-router";
import { UserVM } from "../models/UserVM";
import { useMainStore } from "../store";

const props = defineProps<{
  user: UserVM;
}>();

const router = useRouter();

const { id, name, username, bio, email, website, location, avatar, twitter } =
  toRaw(props.user);

const userEditorObj = reactive({
  id,
  name,
  username,
  bio,
  email,
  website,
  location,
  avatar,
  twitter,
});

const routeToReturn = { name: "Profile" };

async function save() {
  await useMainStore().editUser(userEditorObj as UserVM);
  router.push(routeToReturn);
}

function cancel() {
  router.push(routeToReturn);
}
</script>

<template>
  <div class="profile-card">
    <form @submit.prevent="save">
      <p class="text-center">
        <img
          :src="userEditorObj.avatar"
          class="avatar-xlarge"
          :alt="`${userEditorObj.name} profile picture`"
        />
      </p>

      <div class="form-group">
        <input
          v-model="userEditorObj.username"
          type="text"
          placeholder="Username"
          class="form-input text-lead text-bold"
        />
      </div>

      <div class="form-group">
        <input
          v-model="userEditorObj.name"
          type="text"
          placeholder="Full Name"
          class="form-input text-lead"
        />
      </div>

      <div class="form-group">
        <label for="user_bio">Bio</label>
        <textarea
          id="user_bio"
          v-model="userEditorObj.bio"
          class="form-input"
          placeholder="Write a few words about yourself."
        ></textarea>
      </div>

      <!-- <div class="stats">
        <span v-text="`${postsCount} posts`" />
        <span v-text="`${threadsCount} threads`" />
      </div> -->

      <hr />

      <div class="form-group">
        <label class="form-label" for="user_website">Website</label>
        <input
          id="user_website"
          v-model="userEditorObj.website"
          autocomplete="off"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_email">Email</label>
        <input
          id="user_email"
          v-model="userEditorObj.email"
          autocomplete="off"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_location">Location</label>
        <input
          id="user_location"
          v-model="userEditorObj.location"
          autocomplete="off"
          class="form-input"
        />
      </div>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
