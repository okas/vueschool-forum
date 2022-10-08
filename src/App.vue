<script setup lang="ts">
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { watchEffect } from "vue";
import { useRouter } from "vue-router";
import AppNotifications from "./components/AppNotifications.vue";
import TheNavBar from "./components/TheNavBar.vue";
import { useCommonStore } from "./stores/common-store";

const commonStore = useCommonStore();

const { beforeEach, afterEach } = useRouter();

const { isLoading } = useNProgress(undefined, {
  speed: 200,
  showSpinner: false,
});

watchEffect(() => (isLoading.value = commonStore.isLoading));

beforeEach((to, from) => {
  if (from.name !== to.name) {
    commonStore.setLoading();
  }
});

afterEach((to, from) => {
  if (from.name !== to.name) {
    commonStore.setReady(false);
  }
});
</script>

<template>
  <the-nav-bar />

  <fa v-if="!commonStore.isReady" icon="spinner" spin transform="grow-16 down-16" />

  <main class="container">
    <router-view />
  </main>

  <app-notifications />
</template>

<style lang="scss">
@import "nprogress/nprogress.css";
@import "assets/style.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nprogress .bar {
  background-color: rgb(0 247 255) !important ;
}
</style>
