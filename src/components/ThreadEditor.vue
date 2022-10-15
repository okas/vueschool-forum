<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { ThreadVMFormInput } from "../types/threadVm-types";

const props = defineProps<{
  title?: string;
  text?: string;
}>();

const emits = defineEmits<{
  (e: "save", dto?: ThreadVMFormInput): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const editorObj = reactive({
  title: props.title ?? "",
  text: props.text ?? "",
});

const isDirty = computed(
  () =>
    (editorObj.title ?? "") !== (props.title?.trim() ?? "") ||
    (editorObj.text ?? "") !== (props.text?.trim() ?? "")
);

const submitButtonWord = computed(() => (props.title ? "Update" : "Publish"));

watch(isDirty, (newValue) => emits("update:isDirty", newValue));

function save() {
  emits("update:isDirty", false);
  const dto = isDirty.value ? { ...editorObj } : undefined;
  emits("save", dto);
}

function cancel() {
  emits("cancel");
}
</script>

<template>
  <vee-form @submit="save">
    <app-form-field
      v-model="editorObj.title"
      type="text"
      name="title"
      label="Title"
      rules="required|min:2"
    />

    <app-form-field
      v-model="editorObj.text"
      as="textarea"
      name="text"
      label="Content"
      rules="required|min:2"
      rows="8"
      cols="140"
    />

    <div class="btn-group">
      <button
        class="btn btn-ghost"
        type="button"
        @click.prevent="cancel"
        v-text="`Cancel`"
      />

      <button
        class="btn btn-blue"
        type="submit"
        name="Publish"
        v-text="submitButtonWord"
      />
    </div>
  </vee-form>
</template>
