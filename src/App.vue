<script setup lang="ts">
import { storeToRefs } from "pinia";
import TheNavBar from "./components/TheNavBar.vue";
import { useMainStore } from "./stores/main-store";

const { _isReady } = storeToRefs(useMainStore());
</script>

<template>
  <the-nav-bar />
  <div class="container">
    <div v-show="!_isReady">... --- loading --- ...</div>
    <router-view />
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
