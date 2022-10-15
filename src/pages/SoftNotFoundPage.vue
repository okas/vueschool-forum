<script setup lang="ts">
import { useCommonStore } from "@/stores/common-store";

useCommonStore().setReady();
</script>

<template>
  <div class="col-full text-center">
    <h1>Not Found 😒</h1>
    <h3>
      <em>"Soft 404"</em>
    </h3>
    <router-link :to="{ name: `Home` }">Read some cool threads</router-link>
  </div>
</template>
