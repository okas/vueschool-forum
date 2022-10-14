<script setup lang="ts">
import { type RuleExpression } from "vee-validate";
import { computed } from "vue";
import { getSentenceCase } from "../utils/string-helpers";

const props = defineProps<{
  modelValue: unknown;
  name: string;
  label: string;
  rules?: RuleExpression<unknown>;
  type?: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits("update:modelValue", val);
  },
});
</script>

<template>
  <div class="form-group">
    <label :for="`filed_id_${name}`" v-text="label" />

    <vee-field
      :id="`filed_id_${name}`"
      v-model.trim="value"
      :label="label"
      :name="name"
      class="form-input"
      :rules="rules"
      :type="type"
    />

    <vee-error-message v-slot="{ message }" :name="name" class="form-error" as="span">
      {{ getSentenceCase(message) }}
    </vee-error-message>
  </div>
</template>
