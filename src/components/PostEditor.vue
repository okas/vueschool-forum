<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { PostVMFormInput } from "../types/postVm-types";

const props = defineProps<{
  text?: string;
}>();

const emits = defineEmits<{
  (e: "save", dto: PostVMFormInput): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const submitBtnPhrase = computed(
  () => `${props.text ? "Update" : "Publish"} post`
);

const editorText = ref<string>(props.text);

watch(editorText, (newVal) => {
  const result = (newVal?.trim() ?? "") !== (props.text?.trim() ?? "");

  emits("update:isDirty", result);
});

function save() {
  emits("update:isDirty", false);
  emits("save", { text: editorText.value });
}

function cancel() {
  emits("cancel");
}
</script>

<template>
  <div class="col-full">
    <h1 v-if="!text">
      Create new post in
      <i><slot>current thread</slot></i>
    </h1>
    <form @submit.prevent="save">
      <div class="form-group">
        <label v-if="!text" for="thread_content">Content:</label>
        <textarea
          id="thread_content"
          v-model="editorText"
          class="form-input"
          name="content"
          rows="8"
          cols="140"
        />
      </div>
      <div class="btn-group">
        <button
          v-if="editorText"
          class="btn btn-ghost"
          type="button"
          @click.prevent="cancel"
        >
          Cancel
        </button>
        <button
          class="btn btn-blue"
          type="submit"
          name="Publish"
          v-text="submitBtnPhrase"
        />
      </div>
    </form>
  </div>
</template>
