<script setup lang="ts">
import { ref } from "vue";
import { guidAsBase64 } from "../utils/misc";

const emits = defineEmits<{
  (e: "save", partialPost: Record<string, unknown>): void;
}>();

const text = ref<string>(null);

function save() {
  const post = {
    id: guidAsBase64(),
    text: text.value,
    publishedAt: Math.floor(Date.now() / 1000),
    userId: "NnooaWj4KHVxbhKwO1pEdfaQDsD2",
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
          class="form-input"
          name="content"
          rows="8"
          cols="140"
          v-model="text"
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
