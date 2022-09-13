<script setup lang="ts">
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { useRouter } from "vue-router";
import TheNavBar from "./components/TheNavBar.vue";
import { useCommonStore } from "./stores/common-store";

const commonStore = useCommonStore();
const { isReady } = storeToRefs(commonStore);

const { afterEach } = useRouter();

const { start, done } = useNProgress(undefined, {
  speed: 200,
  showSpinner: false,
});

watch(isReady, (newVal) => newVal && done());

afterEach((to, from) => {
  if (to.name !== from.name) {
    isReady.value = false;
    start();
  }
});
</script>

<template>
  <the-nav-bar />
  <fa v-if="!isReady" icon="spinner" spin transform="grow-16 down-16" />
  <div class="container">
    <router-view />
  </div>
</template>

<style>
@import "nprogress/nprogress.css";
@import "assets/style.css";

/* @import "~bootstrap/css/bootstrap.css"; */
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
