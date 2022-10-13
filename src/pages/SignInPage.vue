<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import useNotifications from "../composables/useNotifications";
import { useCommonStore } from "../stores/common-store";
import { useUserStore } from "../stores/user-store";
import { getValOrFirst } from "../utils/misc";
import { getSentenceCase } from "../utils/string-helpers";

const commonStore = useCommonStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { addNotification } = useNotifications();

const email = ref<string>(null);
const password = ref<string>(null);

async function signIn() {
  try {
    await userStore.signInWithEmailAndPassword(email.value, password.value);
  } catch (err) {
    addNotification(
      {
        message: String(err).includes("auth/missing-email")
          ? "Missing email"
          : err,
        type: "error",
      },
      5000
    );

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

commonStore.setReady();
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form class="card card-form" @submit="signIn">
        <h1 class="text-center">Login</h1>

        <div class="form-group">
          <label for="email">Email</label>
          <vee-field
            id="email"
            v-model.trim="email"
            rules="required|email"
            name="email"
            type="text"
            class="form-input"
          />

          <vee-error-message
            v-slot="{ message }"
            name="email"
            class="form-error"
            as="span"
          >
            {{ getSentenceCase(message) }}
          </vee-error-message>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <vee-field
            id="password"
            v-model.trim="password"
            rules="required"
            type="password"
            class="form-input"
            name="password"
          />

          <vee-error-message
            v-slot="{ message }"
            name="password"
            class="form-error"
            as="span"
          >
            {{ getSentenceCase(message) }}
          </vee-error-message>
        </div>

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{ name: 'Register' }"
            >Create an account?</router-link
          >
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
