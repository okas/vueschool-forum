<script setup lang="ts">
import { useCommonStore } from "../stores/common-store";

useCommonStore().isReady = true;
</script>

<template>
  <div class="col-full text-center">
    <h1>(soft 404) Not Found 😒</h1>
    <router-link :to="{ name: `Home` }">Read some cool threads</router-link>
  </div>
</template>
