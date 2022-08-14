<script setup lang="ts">
import { ref } from "vue";

const props = defineProps();

const title = ref<string>(null);
const text = ref<string>(null);

function save() {}

function cancel() {}
</script>

<template>
  <div class="col-full push-top">
    <h1>Create new thread in <i v-text="forumName" /></h1>

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
          v-mode="text"
          class="form-input"
          name="content"
          rows="8"
          cols="140"
        ></textarea>
      </div>

      <div class="btn-group">
        <button class="btn btn-ghost" @click.prevent="cancel">Cancel</button>
        <button class="btn btn-blue" type="submit" name="Publish">
          Publish
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
