<script setup lang="ts">
import { reactive, toRaw } from "vue";
import { RouteLocationRaw, useRouter } from "vue-router";
import { UserVM } from "../models/UserVM";
import { useMainStore } from "../stores/main-store";
import { UserVmEditForInput } from "../types/userVm-types";

const props = defineProps<{
  user: UserVM;
}>();

const { editUser } = useMainStore();

const router = useRouter();

const { id, name, username, bio, email, website, location, avatar, twitter } =
  toRaw(props.user);

const userEditorObj = reactive<UserVmEditForInput>({
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

const routeToReturn = {
  name: "Profile",
} as RouteLocationRaw;

async function save() {
  await editUser(userEditorObj);

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
          :title="`${userEditorObj.name}'s profile picture`"
        />
      </p>

      <div class="form-group">
        <input
          v-model="userEditorObj.username"
          type="text"
          placeholder="Username"
          class="form-input text-lead text-bold"
          required
          minlength="3"
        />
      </div>

      <div class="form-group">
        <input
          v-model="userEditorObj.name"
          type="text"
          placeholder="Full Name"
          class="form-input text-lead"
          required
          minlength="3"
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

      <hr />

      <div class="form-group">
        <label class="form-label" for="user_email">Email</label>
        <input
          id="user_email"
          v-model="userEditorObj.email"
          autocomplete="off"
          class="form-input"
          required
          type="email"
        />
      </div>

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
        <label class="form-label" for="user_email">Twitter</label>
        <input
          id="user_email"
          v-model="userEditorObj.twitter"
          autocomplete="off"
          class="form-input"
          type="text"
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
