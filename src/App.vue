<script setup lang="ts">
import TheNavBar from "./components/TheNavBar.vue";
import { useMainStore } from "./stores/main-store";

useMainStore().fetchAuthUser();
</script>

<template>
  <the-nav-bar />
  <div class="container">
    <suspense>
      <router-view />
    </suspense>
  </div>
</template>

<style>
@import "assets/style.css";
/* @import "~bootstrap/css/bootstrap.css"; */

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
