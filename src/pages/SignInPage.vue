<script setup lang="ts">
import useNotifications from "@/composables/useNotifications";
import { useCommonStore } from "@/stores/common-store";
import { useUserStore } from "@/stores/user-store";
import { getValOrFirst } from "@/utils/misc";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const commonStore = useCommonStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { addNotification } = useNotifications();

const email = ref<string | undefined>();
const password = ref<string | undefined>();

async function signIn() {
  if (!email.value || !password.value) {
    addNotification({ message: "Incomplete credentials", type: "error" }, 5000);

    return;
  }

  try {
    await userStore.signInWithEmailAndPassword(email.value, password.value);
  } catch (err) {
    console.error(err);
    notifyAuthFailure((err as unknown) as Error);

    return;
  }

  navigate();
}

async function signInWithGoogle() {
  userStore.signInWithGoogle();
  navigate();
}

function navigate() {
  const { redirectTo } = route.query;

  router.push(getValOrFirst(redirectTo) ?? { name: "Home" });
}

function notifyAuthFailure(err: Error) {
  const errStr = String(err);

  addNotification(
    {
      message: errStr.includes("auth/missing-email")
        ? "Missing email"
        : errStr.includes("auth/user-not-found")
        ? "User not found"
        : errStr.includes("auth/wrong-password")
        ? "Incorrect password"
        : errStr,
      type: "error",
    },
    5000
  );
}

commonStore.setReady();
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form class="card card-form" @submit="signIn">
        <h1 class="text-center">Login</h1>

        <app-form-field
          v-model="email"
          name="email"
          type="email"
          rules="required|email"
          label="Email"
        />

        <app-form-field
          v-model="password"
          name="password"
          type="password"
          rules="required"
          label="Password"
        />

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{ name: 'Register' }">Create an account?</router-link>
        </div>
      </vee-form>

      <div class="push-top text-center">
        <button class="btn-red btn-xsmall" @click="signInWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>
