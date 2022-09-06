<script setup lang="ts">
import { useAsyncState, useConfirmDialog } from "@vueuse/core";
import { computed, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import ModalDialog from "../components/ModalDialog.vue";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useMainStore } from "../stores/main-store";
import { ThreadVMFormInput } from "../types/threadVm-types";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const store = useMainStore();

const { isReady } = useAsyncState(async () => {
  await store.fetchForum(props.forumId);
  store._isReady = true;
}, undefined);

const router = useRouter();

const { isRevealed, reveal, confirm } = useConfirmDialog();

const isGoodToGo = ref<boolean>(false);

const forum = computed(() => findById(store.forums, props.forumId));

onBeforeRouteLeave(async () => {
  if (isGoodToGo.value) {
    return (await reveal()).data;
  }
});

async function save({ title, text }: ThreadVMFormInput) {
  const threadId = await store.createThread({
    forumId: props.forumId,
    title,
    text,
  });

  router.push({
    name: "ThreadShow",
    params: { threadId },
  });
}

function cancel() {
  router.push({
    name: "Forum",
    params: { forumId: props.forumId },
  });
}
</script>

<template>
  <div v-if="isReady" class="col-full push-top">
    <h1>
      Create new thread in
      <i v-text="forum.name" />
    </h1>

    <thread-editor
      v-model:is-dirty="isGoodToGo"
      @save="save"
      @cancel="cancel"
    />
  </div>

  <modal-dialog v-if="isRevealed" :confirm="confirm" />
</template>
