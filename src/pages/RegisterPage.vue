<script setup lang="ts">
import { computedAsync, useFileDialog, UseFileDialogOptions } from "@vueuse/core";
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useCommonStore } from "../stores/common-store";
import { useUserStore } from "../stores/user-store";
import { UserVMRegWithEmailAndPassword } from "../types/userVm-types";

const fileDialogOptions: UseFileDialogOptions = {
  multiple: false,
  accept: "image/*",
};

const commonStore = useCommonStore();
const userStore = useUserStore();

const router = useRouter();

const { files, open } = useFileDialog();

const editorObj = reactive({} as UserVMRegWithEmailAndPassword);

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

function openDialog() {
  open(fileDialogOptions);
}

async function register() {
  editorObj.avatarFile = singleFile.value;
  await userStore.registerUserWithEmailAndPassword(editorObj);
  goToProfileEdit();
}

async function registerWithGoogle() {
  await userStore.signInWithGoogle();
  goToProfileEdit();
}

function goToProfileEdit() {
  router.push({ name: "ProfileEdit" });
}
commonStore.setReady();
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <form action="" class="card card-form" @submit.prevent="register">
        <h1 class="text-center">Register</h1>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model.trim="editorObj.name"
            type="text"
            class="form-input"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model.trim="editorObj.username"
            type="text"
            class="form-input"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="editorObj.email"
            type="email"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model.trim="editorObj.password"
            type="password"
            class="form-input"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="avatar">Avatar</label>

          <button
            v-show="!avatarPreviewImgDataUrl"
            id="avatar"
            class="form-input btn-small"
            type="button"
            @click="openDialog"
          >
            Choose file
          </button>

          <div v-if="avatarPreviewImgDataUrl" @click="openDialog">
            <img :src="avatarPreviewImgDataUrl" class="avatar-xlarge" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </form>
      <div class="text-center push-top">
        <button class="btn-red btn-xsmall" @click="registerWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>
