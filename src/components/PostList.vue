<script setup lang="ts">
import type { PostVm } from "@/models/PostVm";
import { useUserStore } from "@/stores/user-store";
import type { PostVMEdit, PostVMFormInput } from "@/types/postVm-types";
import { computed, ref } from "vue";
import PostListItem, { type IPostListItemProps } from "./PostListItem.vue";

const props = defineProps<{
  posts: Array<PostVm>;
}>();

const emits = defineEmits<{
  (e: "edit", dto: PostVMEdit): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const userStore = useUserStore();

const postToEdit = ref<string | undefined>();

const renderData = computed<Array<IPostListItemProps>>(() => [
  ...props.posts.map(transform),
]);

function transform({
  id: postId,
  userId,
  text,
  publishedAt,
  edited,
}: PostVm): IPostListItemProps | undefined {
  const userData = userStore.getUserByIdFn(userId);

  if (!userData) {
    return undefined;
  }

  const {
    name: userName,
    avatar: userAvatar,
    postsCount,
    threadsCount,
  } = userData;

  return {
    postId,
    text,
    publishedAt,
    userId,
    userName,
    userAvatar: userAvatar ?? undefined,
    postsCount,
    threadsCount,
    edited: edited ?? undefined,
  };
}

function savePost(dto: PostVMFormInput | undefined) {
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
