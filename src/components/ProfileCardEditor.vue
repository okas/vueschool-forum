<script setup lang="ts">
import { computedAsync, useFileDialog, UseFileDialogOptions } from "@vueuse/core";
import { computed, reactive, watch } from "vue";
import { UserVM } from "../models/UserVM";
import { UserVmEditForInput } from "../types/userVm-types";

const fileDialogOptions: UseFileDialogOptions = {
  multiple: false,
  accept: "image/*",
};

const props = defineProps<{
  user: UserVM;
}>();

const emits = defineEmits<{
  (e: "save", dto: UserVmEditForInput): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const { files, open } = useFileDialog();

const userEditorObj = reactive<UserVmEditForInput>(props.user);

const singleFile = computed(() => files.value?.item(0));

const avatarPreviewImgDataUrl = computedAsync<string>(
  async () =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = ({ target: { result } }) => resolve(result.toString());
      reader.readAsDataURL(singleFile.value);
    }),
  undefined,
  { lazy: true }
);

const avatarToShow = computed(
  () => avatarPreviewImgDataUrl.value ?? userEditorObj.avatar
);

watch(
  userEditorObj,
  ({ id, name, username, bio, email, website, location, avatar, twitter }) => {
    const result =
      (id ?? "") !== (props.user?.id.trim() ?? "") ||
      (name ?? "") !== (props.user?.name.trim() ?? "") ||
      (username ?? "") !== (props.user?.username.trim() ?? "") ||
      (bio ?? "") !== (props.user?.bio?.trim() ?? "") ||
      (email ?? "") !== (props.user?.email.trim() ?? "") ||
      (website ?? "") !== (props.user?.website?.trim() ?? "") ||
      (location ?? "") !== (props.user?.location?.trim() ?? "") ||
      (avatar ?? "") !== (props.user?.avatar?.trim() ?? "") ||
      (twitter ?? "") !== (props.user?.twitter.trim() ?? "");

    emits("update:isDirty", result);
  }
);

function openDialog() {
  open(fileDialogOptions);
}

function save() {
  emits("update:isDirty", false);
  userEditorObj.avatarFile = singleFile.value;
  emits("save", userEditorObj);
}

function cancel() {
  emits("cancel");
}
</script>

<template>
  <div class="profile-card">
    <form @submit.prevent="save">
      <div class="form-group" @click="openDialog">
        <img
          :src="avatarToShow"
          class="avatar-xlarge"
          :title="`${userEditorObj.name}'s profile picture`"
        />
      </div>

      <div class="form-group">
        <input
          v-model.trim="userEditorObj.username"
          type="text"
          placeholder="Username"
          class="form-input text-lead text-bold"
          required
          minlength="3"
        />
      </div>

      <div class="form-group">
        <input
          v-model.trim="userEditorObj.name"
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
          v-model.trim="userEditorObj.bio"
          class="form-input"
          placeholder="Write a few words about yourself."
        ></textarea>
      </div>

      <hr />

      <div class="form-group">
        <label class="form-label" for="user_email">Email</label>
        <input
          id="user_email"
          v-model.trim="userEditorObj.email"
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
          v-model.trim="userEditorObj.website"
          autocomplete="off"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_email">Twitter</label>
        <input
          id="user_email"
          v-model.trim="userEditorObj.twitter"
          autocomplete="off"
          class="form-input"
          type="text"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_location">Location</label>
        <input
          id="user_location"
          v-model.trim="userEditorObj.location"
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
