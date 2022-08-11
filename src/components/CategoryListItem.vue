<script setup lang="ts">
import { useRoute } from "vue-router";
import { ForumVM } from "../models/ForumVM";
import ForumList from "./ForumList.vue";

const props = defineProps<{
  categoryId: string;
  name: string;
  forums: Array<ForumVM>;
}>();

const { params } = useRoute();

const showCategoryLink = params.categoryId !== props.categoryId;
</script>

<template>
  <div class="forum-list">
    <h2 class="list-title">
      <router-link
        v-if="showCategoryLink"
        :to="{ name: 'Category', params: { categoryId } }"
      >
        {{ name }}
      </router-link>
      <span v-else v-text="name" />
    </h2>
    <forum-list :forums="forums" />
  </div>
</template>

<style scoped></style>
