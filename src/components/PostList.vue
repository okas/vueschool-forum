<script setup lang="ts">
import { computed } from "vue";
import { PostVm } from "../models/PostVm";
import { useUserStore } from "../stores/user-store";
import { PostVMEdit } from "../types/postVm-types";
import PostListItem from "./PostListItem.vue";

const props = defineProps<{
  posts: Array<PostVm>;
}>();

const emits = defineEmits<{
  (e: "edit", dto: PostVMEdit): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const userStore = useUserStore();

const renderData = computed(() =>
  props.posts.map(({ id: postId, userId, text, publishedAt, edited }) => {
    const {
      name: userName,
      avatar: userAvatar,
      postsCount,
      threadsCount,
    } = userStore.getUserByIdFn(userId);

    return {
      postId,
      text,
      publishedAt,
      userId,
      userName,
      userAvatar,
      postsCount,
      threadsCount,
      edited,
    };
  })
);

function passEditEvent(dto: PostVMEdit) {
  emits("edit", dto);
}

function passUpdateIsDirtyEvent(dto: boolean) {
  emits("update:isDirty", dto);
}
</script>

<template>
  <div class="post-list">
    <post-list-item
      v-for="post of renderData"
      :key="post.postId"
      v-bind="post"
      @edit="passEditEvent"
      @update:is-dirty="passUpdateIsDirtyEvent"
    />
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 20px;
}
</style>
