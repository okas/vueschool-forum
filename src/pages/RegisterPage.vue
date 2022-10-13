<script setup lang="ts">
import { ErrorMessage, Field, Form as VeeForm } from "vee-validate";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AvatarFilePicker from "../components/AvatarFilePicker.vue";
import AvatarRandomPicker from "../components/AvatarRandomPicker.vue";
import { useCommonStore } from "../stores/common-store";
import { useUserStore } from "../stores/user-store";
import type { IFileInfo } from "../types/avatar-utility-types";
import type { UserVMRegWithEmailAndPassword } from "../types/userVm-types";

const commonStore = useCommonStore();
const userStore = useUserStore();

const router = useRouter();

const isPickerRevealed = ref(false);

const userSelectedAvatarFileData = ref<IFileInfo | undefined>();

const editorObj = reactive({} as UserVMRegWithEmailAndPassword);

async function register() {
  editorObj.avatarFile = userSelectedAvatarFileData.value?.file;
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

function storeFileDateToState(dto: IFileInfo) {
  userSelectedAvatarFileData.value = dto;
}

function toggleButtonAndPicker() {
  isPickerRevealed.value = !isPickerRevealed.value;
}

function validateRequired<TValue>(value: TValue): boolean | string {
  return String(value).trim() ? true : `This is required`;
}

commonStore.setReady();
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form class="card card-form" @submit="register">
        <h1 class="text-center">Register</h1>

        <div class="form-group">
          <label for="name">Full Name</label>
          <field
            id="name"
            v-model.trim="editorObj.name"
            :rules="validateRequired"
            name="name"
            type="text"
            class="form-input"
          />
          <error-message name="name" class="form-error" />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <field
            id="username"
            v-model.trim="editorObj.username"
            name="username"
            type="text"
            class="form-input"
            :rules="validateRequired"
          />
          <error-message name="username" class="form-error" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <field
            id="email"
            v-model.trim="editorObj.email"
            name="email"
            type="email"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <field
            id="password"
            v-model.trim="editorObj.password"
            name="password"
            type="password"
            class="form-input"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="avatar">Avatar</label>
          <button
            v-show="!isPickerRevealed"
            id="avatar"
            class="form-input btn-small"
            type="button"
            @click.prevent="toggleButtonAndPicker"
          >
            Choose
          </button>

          <template v-if="isPickerRevealed">
            <avatar-file-picker
              :avatar-src="userSelectedAvatarFileData?.objUrl"
              @img-loaded="commonStore.setLoading(false)"
              @file-picked="storeFileDateToState"
            >
            </avatar-file-picker>

            <avatar-random-picker
              :disabled="commonStore.isLoading"
              @file-picked="storeFileDateToState"
              @start="commonStore.setLoading"
            />
          </template>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </vee-form>

      <div class="text-center push-top">
        <button class="btn-red btn-xsmall" @click="registerWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>
