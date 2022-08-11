<template>
  <the-nav-bar />
  <div class="container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import TheNavBar from "./components/TheNavBar.vue";
</script>

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
