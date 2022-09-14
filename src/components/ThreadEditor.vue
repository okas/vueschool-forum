<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { ThreadVMFormInput } from "../types/threadVm-types";

const props = defineProps<{
  title?: string;
  text?: string;
}>();

const emits = defineEmits<{
  (e: "save", dto: ThreadVMFormInput): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const editorObj = reactive({
  title: props.title,
  text: props.text,
});

const submitButtonWord = computed(() => (props.title ? "Update" : "Publish"));

watch(editorObj, ({ title, text }) => {
  const result =
    (title ?? "") !== (props.title?.trim() ?? "") ||
    (text ?? "") !== (props.text?.trim() ?? "");

  emits("update:isDirty", result);
});

function save() {
  emits("update:isDirty", false);
  emits("save", { ...editorObj });
}

function cancel() {
  emits("cancel");
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <label for="thread_title">Title:</label>
      <input
        id="thread_title"
        v-model.trim="editorObj.title"
        type="text"
        class="form-input"
        name="title"
      />
    </div>

    <div class="form-group">
      <label for="thread_content">Content:</label>
      <textarea
        id="thread_content"
        v-model.trim="editorObj.text"
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
      <button
        class="btn btn-blue"
        type="submit"
        name="Publish"
        v-text="submitButtonWord"
      ></button>
    </div>
  </form>
</template>
