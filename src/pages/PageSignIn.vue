<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMainStore } from "../stores/main-store";

const store = useMainStore();
const router = useRouter();
const route = useRoute();

const email = ref<string>(null);
const password = ref<string>(null);

async function signIn() {
  try {
    await store.signInWithEmailAndPassword(email.value, password.value);
  } catch (err) {
    alert(err);
  }

  navigate();
}

async function signInWithGoogle() {
  store.signInWithGoogle();
  navigate();
}

function navigate() {
  const { redirectTo } = route.query;

  router.push(
    Array.isArray(redirectTo) ? redirectTo[0] : redirectTo ?? { name: "Home" }
  );
}

store._isReady = true;
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <form class="card card-form" @submit.prevent="signIn">
        <h1 class="text-center">Login</h1>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="text"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
          />
        </div>

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{ name: 'Register' }">
            Create an account?
          </router-link>
        </div>
      </form>

      <div class="push-top text-center">
        <button class="btn-red btn-xsmall" @click="signInWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>
