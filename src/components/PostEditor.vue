<script setup lang="ts">
import { ref } from "vue";
import { PostVMFormInput } from "../types/PostVMTypes";

const emits = defineEmits<{
  (e: "save", dto: PostVMFormInput): void;
}>();

const text = ref<string>(null);

function save() {
  const post: PostVMFormInput = {
    text: text.value,
    publishedAt: Math.floor(Date.now() / 1000),
    userId: useMainStore().authId,
  };

  emits("save", post);

  text.value = null;
}
</script>

<template>
  <div>
    <h1>
      Create new post in <i><slot>current thread</slot></i>
    </h1>
    <form @submit.prevent="save">
      <div class="form-group">
        <label for="thread_content">Content:</label>
        <textarea
          id="thread_content"
          v-model="text"
          class="form-input"
          name="content"
          rows="8"
          cols="140"
        />
      </div>
      <div class="btn-group">
        <button class="btn btn-ghost">Cancel</button>
        <button class="btn btn-blue" type="submit" name="Publish">
          Publish
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
