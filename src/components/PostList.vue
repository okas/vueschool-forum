<script setup lang="ts">
import { computed, ref } from "vue";
import { PostVm } from "../models/PostVm";
import { useUserStore } from "../stores/user-store";
import { PostVMEdit, PostVMFormInput } from "../types/postVm-types";
import { getCountPhrase, getProfileTitle } from "../utils/misc";
import PostEditor from "./PostEditor.vue";

const props = defineProps<{
  posts: Array<PostVm>;
}>();

const emits = defineEmits<{
  (e: "edit", dto: PostVMEdit): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const userStore = useUserStore();

const renderData = computed(() =>
  props.posts.map(({ id, userId, text, publishedAt, edited }) => {
    const {
      name: userName,
      avatar: userAvatar,
      postsCount,
      threadsCount,
    } = userStore.getUserByIdFn(userId);

    return {
      id,
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

const editingPostId = ref<PostVm | null>(null);

function toggleEditModeForPost(postId: string) {
  editingPostId.value =
    editingPostId.value?.id === postId
      ? null
      : props.posts.find(({ id }) => id === postId);
}

function revealForEditingPost(id: string): boolean {
  return !!userStore.authUserId && editingPostId.value?.id === id;
}

function isUserOwnPost(userId: string): boolean {
  return userId === userStore.authUserId;
}

function passDirtyEvent(data: boolean) {
  emits("update:isDirty", data);
}

function savePost(dto: PostVMFormInput) {
  if (dto) {
    const post: PostVMEdit = {
      id: editingPostId.value.id,
      ...dto,
    };
    emits("edit", post);
  }
  toggleEditModeForPost(editingPostId.value.id);
}
</script>

<template>
  <div class="post-list">
    <div
      v-for="{
        id,
        text,
        publishedAt,
        userId,
        userAvatar,
        userName,
        postsCount,
        threadsCount,
        edited,
      } of renderData"
      :key="id"
      class="post"
    >
      <div class="user-info">
        <a href="#" class="user-name" v-text="userName" />

        <a href="#">
          <app-avatar-img
            class="avatar-large"
            :src="userAvatar"
            :title="getProfileTitle(userName)"
          />
        </a>

        <p
          class="desktop-only text-small"
          v-text="getCountPhrase(postsCount, 'post')"
        />
        <p
          class="desktop-only text-small"
          v-text="getCountPhrase(threadsCount, 'thread')"
        />

        <span class="online desktop-only">online</span>
      </div>

      <div class="post-content">
        <div>
          <post-editor
            v-if="revealForEditingPost(id)"
            :text="text"
            @update:is-dirty="passDirtyEvent"
            @save="savePost"
            @cancel="toggleEditModeForPost(id)"
          />
          <p v-else v-text="text" />
        </div>

        <a
          v-if="isUserOwnPost(userId)"
          href="#"
          style="margin-left: auto; padding-left: 0.625rem"
          class="link-unstyled"
          title="Make a change"
          @click.prevent="toggleEditModeForPost(id)"
        >
          <fa icon="pencil-alt" />
        </a>
      </div>

      <div class="post-date text-faded">
        <span v-if="edited?.at">
          edited
          <em><app-date :timestamp="edited?.at" /></em>
          |
        </span>
        <span>
          created
          <em><app-date :timestamp="publishedAt" /></em>
        </span>
      </div>

      <!-- <div class="reactions">
          <ul>
            <li>💡</li>
            <li>❤️</li>
            <li>👎</li>
            <li>👍</li>
            <li>👌</li>
          </ul>
          <button class="btn-xsmall"><span class="emoji">❤️</span>️ 3</button>
          <button class="btn-xsmall active-reaction">
            <span class="emoji">👌️</span>️ 1
          </button>
          <button class="btn-xsmall">
            + <i class="fa fa-smile-o emoji"></i>
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 20px;
}

.post {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: white;
  padding: 20px 10px;
  padding-bottom: 7px;
  box-shadow: 2px 2px 1px rgb(136 136 136 / 9%);
  margin-bottom: 20px;
}

@media (max-width: 820px) {
  .post {
    padding: 0;
  }
}

.post .user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  flex: 1 1 15%;
  margin-right: 5px;
}

.post .user-info > * {
  margin-bottom: 10px;
}

@media (max-width: 820px) {
  .post .user-info {
    order: -2;
    flex-direction: row;
    justify-content: flex-start;
    background: rgb(73 89 96 / 6%);
    margin-right: 0;
    padding: 5px;
    padding-left: 10px;
  }

  .post .user-info .avatar-large {
    height: 35px;
    width: 35px;
    margin-right: 5px;
    order: 1;
  }

  .post .user-info .user-name {
    order: 2;
  }

  .post .user-info > * {
    margin-right: 5px;
    margin-bottom: 0;
  }
}

.post .post-date {
  flex-basis: 100%;
  font-size: 14px;
  text-align: right;
  margin-bottom: 5px;
  padding-right: 7px;
}

@media (max-width: 820px) {
  .post .post-date {
    order: -1;
    flex-basis: 40%;
    background: rgb(73 89 96 / 6%);
    padding-right: 10px;
    padding-top: 16px;
    margin-bottom: 0;
  }
}

@media (max-width: 720px) {
  .post {
    padding: 0;
  }
}

.post-content {
  display: flex;
  flex: 1 0 83%;
  padding-left: 15px;
  padding-right: 10px;
  font-size: 16px;
  text-align: justify;
  line-height: 1.5;
  word-break: break-word;
}

.post-content h1,
.post-content h2,
.post-content h3 {
  margin-bottom: 0;
}

.post-content p {
  margin-bottom: 20px;
}

.post-content pre {
  display: grid;
  overflow: auto;
  word-wrap: break-word;
  border-radius: 3px;
  padding: 10px;
}

.post-content blockquote {
  margin: 25px 0;
}

.post-content blockquote.big {
  display: flex;
  position: relative;
}

.post-content blockquote.big::before {
  position: absolute;
  top: -25px;
  left: -25px;
  font-size: 42px;

  /* font-family: FontAwesome; */
  content: "\f10e";
  color: #263959;
}

@media (max-width: 820px) {
  .post-content blockquote.big::before {
    top: -15px;
    left: -18px;
    font-size: 32px;
  }
}

.post-content blockquote.big .quote {
  padding-left: 20px;
  padding-right: 15px;
  flex-basis: 95%;
  font-weight: 100;
  font-style: italic;
  font-size: 17px;
}

.post-content blockquote.big .author {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

.post-content blockquote.big .author img {
  flex: 1;
  flex-basis: 100%;
  margin-top: 10px;
  width: 80px;
  height: 80px;
}

.post-content blockquote.small {
  /* display: flex; */
  position: relative;
  flex-direction: column;
  border: 2px solid rgb(152 152 152 / 15%);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.post-content blockquote.small::before {
  position: absolute;
  top: -20px;
  left: -20px;
  font-size: 42px;

  /* font-family: FontAwesome; */
  content: "\f10e";
  color: #263959;
}

@media (max-width: 820px) {
  .post-content blockquote.small::before {
    top: -18px;
    left: -15px;
    font-size: 32px;
  }
}

.post-content blockquote.small .author {
  display: flex;
  flex-basis: 100%;
  padding: 3px 10px 3px 28px;
  background-color: rgb(152 152 152 / 15%);
  justify-content: center;
  align-items: center;
}

.post-content blockquote.small .author .time {
  margin-left: 10px;
}

.post-content blockquote.small .author .fa {
  margin-left: auto;
  font-size: 20px;
}

.post-content blockquote.small .author .fa:hover {
  cursor: pointer;
}

.post-content blockquote.small .quote {
  display: flex;
  flex-basis: 100%;
  flex-direction: column;
  padding: 10px;
  font-weight: 100;
  font-style: italic;
  font-size: 17px;
}

.post-content blockquote.simple {
  position: relative;
  padding: 0 10px 0 20px;
  font-weight: 100;
  font-style: italic;
  font-size: 17px;
  letter-spacing: 0.15px;
}

.post-content blockquote.simple::before {
  position: absolute;
  top: -25px;
  left: -25px;
  font-size: 42px;

  /* font-family: FontAwesome; */
  content: "\f10e";
  color: #263959;
}

@media (max-width: 820px) {
  .post-content blockquote.simple::before {
    top: -15px;
    left: -18px;
    font-size: 32px;
  }
}

.post-content blockquote.simple .author {
  display: block;
  margin-top: 10px;
  font-weight: normal;
}

.post-content blockquote.simple .author .time {
  margin-left: 10px;
}

.post-listing-editor {
  flex: 1 1 83%;
}
</style>
