<script setup lang="ts">
import { useAsyncState, useConfirmDialog } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useMainStore } from "../stores/main-store";
import { ThreadVMFormInput } from "../types/threadVm-types";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  threadId: string;
}>();

const store = useMainStore();

const { isReady } = useAsyncState(async () => {
  const { firstPostId } = await store.fetchThread(props.threadId);
  await store.fetchPost(firstPostId);
  store._isReady = true;
}, undefined);

const router = useRouter();

const { isRevealed, reveal, confirm } = useConfirmDialog();

const isGoodToGo = ref<boolean>(false);

const thread = computed(() => findById(store.threads, props.threadId));

const firstPostText = computed(
  () => findById(store.posts, thread.value.firstPostId)?.text
);

provide(confirmInjectKey, confirm);

onBeforeRouteLeave(async () => {
  if (isGoodToGo.value) {
    return (await reveal()).data;
  }
});

async function save({ title, text }: ThreadVMFormInput) {
  await store.editThread({
    id: props.threadId,
    title,
    text,
  });

  functionGoToThread();
}

function cancel() {
  functionGoToThread();
}

function functionGoToThread() {
  router.push({
    name: "ThreadShow",
    params: { threadId: props.threadId },
  });
}
</script>

<template>
  <div v-if="isReady" class="col-full push-top">
    <h1>Editing <i v-text="thread.title" /></h1>

    <thread-editor
      v-model:is-dirty="isGoodToGo"
      :title="thread.title"
      :text="firstPostText"
      @save="save"
      @cancel="cancel"
    />
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
