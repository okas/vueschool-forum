<script lang="ts">
export const confirmInjectKey = Symbol("model confirm cb");
</script>

<script setup lang="ts">
import { inject } from "vue";

const injectedConfirmCb: ((data: boolean) => void) | undefined = inject(confirmInjectKey);
</script>

<template>
  <teleport to="body">
    <div class="modal-layout">
      <div class="modal">
        <h2>
          Are you sure you want to leave?
          <br />
          Unsaved changes will be lost!
        </h2>
        <div class="btn-group">
          <button class="btn btn-red" @click.prevent="injectedConfirmCb?.(true)">
            Yes
          </button>
          <button class="btn btn-blue" @click.prevent="injectedConfirmCb?.(false)">
            No
          </button>
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
