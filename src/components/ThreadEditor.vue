<script setup lang="ts">
import { ref } from "vue";
import { ThreadVMFormInput } from "../types/ThreadVMTypes";

const emits = defineEmits<{
  (e: "save", dto: ThreadVMFormInput): void;
  (e: "cancel"): void;
}>();

const title = ref<string>(null);
const text = ref<string>(null);

function save() {
  emits("save", {
    title: title.value,
    text: text.value,
  });
  clearForm();
}

function cancel() {
  emits("cancel");
  clearForm();
}

function clearForm() {
  title.value = null;
  text.value = null;
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <label for="thread_title">Title:</label>
      <input
        id="thread_title"
        v-model="title"
        type="text"
        class="form-input"
        name="title"
      />
    </div>

    <div class="form-group">
      <label for="thread_content">Content:</label>
      <textarea
        id="thread_content"
        v-model="text"
        class="form-input"
        name="content"
        rows="8"
        cols="140"
      ></textarea>
    </div>

    <div class="btn-group">
      <button class="btn btn-ghost" type="button" @click.prevent="cancel">
        Cancel
      </button>
      <button class="btn btn-blue" type="submit" name="Publish">Publish</button>
    </div>
  </form>
</template>

<style scoped></style>
