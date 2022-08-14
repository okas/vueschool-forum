<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMainStore } from "../store/index";

const props = defineProps<{
  forumId: string;
}>();

const router = useRouter();

const title = ref<string>(null);
const text = ref<string>(null);

const { name: forumName } = useMainStore().forums.find(
  ({ id }) => id === props.forumId
);

function save() {
  useMainStore().createThread({
    forumId: props.forumId,
    title: title.value,
    text: text.value,
  });
  clear();
  goToForum();
}

function cancel() {
  clear();
  goToForum();
}

function clear() {
  title.value = null;
  text.value = null;
}

function goToForum() {
  router.push({ name: "Forum" });
}
</script>

<template>
  <div class="col-full push-top">
    <h1>
      Create new thread in
      <i v-text="forumName" />
    </h1>

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
        <button class="btn btn-blue" type="submit" name="Publish">
          Publish
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
