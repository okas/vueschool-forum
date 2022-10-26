<script setup lang="ts">
import { useConfirmDialog, useScrollLock } from "@vueuse/core";
import { ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const props = defineProps<{
  revealCondition: boolean;
  isWaiting: boolean;
}>();

const emits = defineEmits<{
  (e: "submit", email: string, password: string): void;
  (e: "cancel"): void;
}>();

const { isRevealed, reveal, cancel } = useConfirmDialog();

const email = ref<string>("");
const password = ref<string>("");

const isLocked = useScrollLock(window.document.body);

watch(isRevealed, (newVal) => (isLocked.value = newVal), { immediate: true });

watch(
  () => props.revealCondition,
  (newState) => (newState ? reveal() : cancel())
);

onBeforeRouteLeave(async () => !props.revealCondition);

function reAuthenticate() {
  emits("submit", email.value, password.value);
}

function cancelReauth() {
  emits("cancel");
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
          <header>
            <h2>Please confirm old credentials</h2>
          </header>

          <section>Just to be sure we are going to be on safe side 😊</section>

          <section>
            <vee-form @submit="reAuthenticate">
              <app-form-field
                v-model="email"
                name="reauth-email"
                type="email"
                rules="required|email"
                label="Email"
              />

              <app-form-field
                v-model="password"
                name="reauth-password"
                type="password"
                rules="required"
                label="Password"
              />

              <div class="modal-footer">
                <app-spinner v-if="isWaiting" class="loader-indicator" />

                <div class="modal-action btn-group">
                  <button class="btn btn-green">Log in</button>

                  <button class="btn btn-blue" @click.prevent="cancelReauth">
                    cancel
                  </button>
                </div>
              </div>
            </vee-form>
          </section>
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

.modal-footer {
  display: flex;
  align-items: center;

  .loader-indicator {
    margin-left: 5rem;
  }
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
