<script setup lang="ts">
import { useNProgress } from "@vueuse/integrations/useNProgress";
import { watchEffect } from "vue";
import TheNavBar from "./components/TheNavBar.vue";
import { useCommonStore } from "./stores/common-store";

const commonStore = useCommonStore();

const { isLoading } = useNProgress(undefined, {
  speed: 200,
  showSpinner: false,
});

watchEffect(() => (isLoading.value = commonStore.isLoading));
</script>

<template>
  <the-nav-bar />

  <app-spinner v-if="!commonStore.isReady" transform="down-16" />

  <router-view v-slot="{ Component, route: { path, meta } }">
    <transition :name="meta.transitionName" mode="out-in">
      <main :key="path" class="container">
        <component :is="Component" />
      </main>
    </transition>
  </router-view>

  <router-view name="footer">
    <the-footer />
  </router-view>

  <app-notifications />
</template>

<style scoped lang="scss">
.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.2s ease;
  }

  &-enter-from,
  &-leave-active {
    opacity: 0;
  }
}
</style>

<style lang="scss">
@import "nprogress/nprogress.css";
@import "assets/style";

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

html {
  padding-right: calc(17px - (100vw - 100%));
}
</style>
