<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { type RuleExpression } from "vee-validate";
import { computed, useAttrs } from "vue";
import { guidAsBase64 } from "../utils/misc";
import { getSentenceCase } from "../utils/string-helpers";

const props = defineProps<{
  modelValue: unknown;
  name: string;
  label?: string;
  rules?: RuleExpression<unknown>;
  type?: string;
  as?: string;
  validateOnBlur?: boolean;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const attrs = useAttrs();

const elemId = guidAsBase64();

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
    <label v-if="label" :for="elemId" v-text="label" />

    <vee-field
      v-bind="attrs"
      :id="elemId"
      v-model.trim="value"
      :as="as"
      :label="label"
      :name="name"
      class="form-input"
      :rules="rules"
      :type="type"
      :validate-on-blur="validateOnBlur"
    />

    <vee-error-message v-slot="{ message }" :name="name" class="form-error" as="span">
      {{ getSentenceCase(message) }}
    </vee-error-message>
  </div>
</template>
