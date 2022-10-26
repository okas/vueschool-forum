<script lang="ts">
import type { InjectionKey } from "vue";

export const confirmInjectKey = Symbol("model confirm cb") as InjectionKey<
  (userAnswer: boolean) => void
>;
</script>

<script setup lang="ts">
import { useConfirmDialog, useScrollLock } from "@vueuse/core";
import { inject, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const props = defineProps<{
  revealCondition: boolean;
}>();

const { isRevealed, reveal, confirm } = useConfirmDialog<boolean, boolean, boolean>();

const isLocked = useScrollLock(window.document.body);

watch(isRevealed, (newVal) => (isLocked.value = newVal), { immediate: true });

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
    <section class="modal">
      <transition name="fade" mode="out-in">
        <div v-if="isRevealed" class="modal-container" />
      </transition>

      <transition name="scale" mode="out-in">
        <div v-if="isRevealed" class="modal-dialog">
          <header class="model-content">
            <h2>
              Are you sure you want to leave?
              <br />
              Unsaved changes will be lost!
            </h2>
          </header>

          <div class="modal-action btn-group">
            <button class="btn btn-red" @click.prevent="confirmHandler(true)">Yes</button>

            <button class="btn btn-blue" @click.prevent="confirmHandler(false)">
              No
            </button>
          </div>
        </div>
      </transition>
    </section>
  </teleport>
</template>

<style scoped lang="scss">
.modal-dialog {
  padding: 2rem;
  background-color: blanchedalmond;
  border-radius: 1.25rem;
  position: fixed;
  left: 50%;
  top: 50%;
  width: 500px;
  max-width: 100%;
  z-index: 300;
  transform: translate(-50%, -50%);
}

.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.15s ease;
  }

  &-enter-from,
  &-leave-active {
    opacity: 0;
  }
}

.scale {
  &-enter-active,
  &-leave-active {
    transition: all 0.15s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translate(-51%, -51%) scale(0.9);
  }
}
</style>
