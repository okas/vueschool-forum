<script lang="ts">
import type { InjectionKey } from "vue";

export const confirmInjectKey = Symbol("model confirm cb") as InjectionKey<
  (userAnswer: boolean) => void
>;
</script>

<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";
import { inject } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const props = defineProps<{
  revealCondition: boolean;
}>();

const { isRevealed, reveal, confirm } = useConfirmDialog<boolean, boolean, boolean>();

// Allows optional callback injection from consumer, to notify confirmation answer.
const injectedConfirmCb = inject(confirmInjectKey, undefined);

onBeforeRouteLeave(async () =>
  props.revealCondition ? (await reveal(false)).data : undefined
);

function confirmHandler(userResponse: boolean) {
  injectedConfirmCb?.(userResponse);
  confirm(userResponse);
}
</script>

<template>
  <teleport to="body">
    <div v-if="isRevealed" class="modal-layout">
      <div class="modal">
        <h2>
          Are you sure you want to leave?
          <br />
          Unsaved changes will be lost!
        </h2>

        <div class="btn-group">
          <button class="btn btn-red" @click.prevent="confirmHandler(true)">Yes</button>

          <button class="btn btn-blue" @click.prevent="confirmHandler(false)">No</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.modal-layout {
  z-index: 20;
  left: 0;
  top: 0;
  position: fixed;
  background-color: #7c7c7c7a;
  width: 100%;
  height: 100%;

  .modal {
    padding: 2rem;
    background-color: blanchedalmond;
    border-radius: 1.25rem;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    max-width: 100%;
    z-index: 10;
  }

  .button:focus {
    outline: rgb(91 91 255) solid 3px;
  }
}
</style>
