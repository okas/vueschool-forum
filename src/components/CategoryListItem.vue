<script setup lang="ts">
import { useRoute } from "vue-router";
import { ForumItemVM } from "../models/ForumItemVM";
import ForumList from "./ForumList.vue";

const { params } = useRoute();

const props = defineProps({
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  forums: { type: Array<ForumItemVM>, required: true },
});

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
