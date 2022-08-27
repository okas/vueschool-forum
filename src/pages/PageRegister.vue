<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useMainStore } from "../stores/main-store";
import { UserVMNewFormInput } from "../types/userVm-types";

const store = useMainStore();

const router = useRouter();

const editorObj = reactive<UserVMNewFormInput>({} as UserVMNewFormInput);

const password = ref("");

async function register() {
  const newUserId = await store.createUser(editorObj, password.value);

  store.authUserId = newUserId;

  await store.fetchAuthUser();

  router.push({ name: "Profile" });
}

store._isReady = true;
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
            v-model="editorObj.name"
            type="text"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="editorObj.username"
            type="text"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="editorObj.email"
            type="email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="avatar">Avatar</label>
          <input
            id="avatar"
            v-model="editorObj.avatar"
            type="text"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </form>
      <div class="text-center push-top">
        <button class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
