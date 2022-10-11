<script setup lang="ts">
import { computed, ref } from "vue";
import { PostVm } from "../models/PostVm";
import { useUserStore } from "../stores/user-store";
import { PostVMEdit, PostVMFormInput } from "../types/postVm-types";
import PostListItem from "./PostListItem.vue";

const props = defineProps<{
  posts: Array<PostVm>;
}>();

const emits = defineEmits<{
  (e: "edit", dto: PostVMEdit): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const userStore = useUserStore();

const postToEdit = ref<string | undefined>();

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

function savePost(dto: PostVMFormInput) {
  if (dto && postToEdit.value) {
    const post: PostVMEdit = {
      id: postToEdit.value,
      ...dto,
    };

    emits("edit", post);
  }

  endEditing();
}

function passUpdateIsDirtyEvent(dto: boolean) {
  emits("update:isDirty", dto);
}

function endEditing() {
  postToEdit.value = undefined;
}

function listItemClickEdit(postId: string) {
  postToEdit.value = postId;
}

function verifyIfIsEditing(postId: string) {
  return postId === postToEdit.value;
}
</script>

<template>
  <div class="post-list">
    <post-list-item
      v-for="post of renderData"
      :key="post.postId"
      v-bind="post"
      @click-edit="listItemClickEdit"
    >
      <post-editor
        v-if="verifyIfIsEditing(post.postId)"
        :text="post.text"
        @update:is-dirty="passUpdateIsDirtyEvent"
        @save="savePost"
        @cancel="endEditing"
      />
    </post-list-item>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 20px;
}
</style>
