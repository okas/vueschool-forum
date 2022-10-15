<script setup lang="ts">
import type { PostVMFormInput } from "@/types/postVm-types";
import { guidAsBase64 } from "@/utils/misc";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  text?: string;
  validateOnBlur?: boolean;
}>();

const emits = defineEmits<{
  (e: "save", dto?: PostVMFormInput | undefined): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
}>();

const formKey = ref<string>(guidAsBase64());

const editorText = ref<string>(props.text ?? "");

const isDirty = computed(() => (editorText.value ?? "") !== (props.text?.trim() ?? ""));

const submitBtnPhrase = computed(() => `${props.text ? "Update" : "Publish"} post`);

const unWatch = watch(isDirty, (newValue) => emits("update:isDirty", newValue));

function save() {
  unWatch?.();

  emits("update:isDirty", false);

  const dto = isDirty.value ? { text: editorText.value } : undefined;

  emits("save", dto);

  resetForm();
}

function cancel() {
  emits("cancel");

  resetForm();
}

function resetForm() {
  // Should use `resetForm` or `handleReset` slot props of the Form,
  // but didn't work as expected.`
  editorText.value = "";
  formKey.value = guidAsBase64();
}
</script>

<template>
  <div class="col-full">
    <h1 v-if="!text">
      Create new post in
      <i>
        <slot> current thread </slot>
      </i>
    </h1>

    <vee-form :key="formKey" @submit="save">
      <app-form-field
        v-model="editorText"
        as="textarea"
        name="text"
        label="Content"
        rules="required|min:2"
        rows="8"
        cols="140"
        :validate-on-blur="validateOnBlur"
      />

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
    </vee-form>
  </div>
</template>
