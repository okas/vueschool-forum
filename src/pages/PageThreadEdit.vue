<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useCommonStore } from "../stores/common-store";
import { usePostStore } from "../stores/post-store";
import { useThreadStore } from "../stores/threads-store";
import { ThreadVMFormInput } from "../types/threadVm-types";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  threadId: string;
}>();

const commonStore = useCommonStore();
const postStore = usePostStore();
const threadStore = useThreadStore();

const router = useRouter();

const { isRevealed, reveal, confirm } = useConfirmDialog();

const hasDirtyForm = ref<boolean>(false);

const thread = computed(() => findById(threadStore.items, props.threadId));

const firstPostText = computed(
  () => findById(postStore.items, thread.value.firstPostId)?.text
);

provide(confirmInjectKey, confirm);

onBeforeRouteLeave(async () => {
  if (hasDirtyForm.value) {
    return (await reveal()).data;
  }
});

async function save({ title, text }: ThreadVMFormInput) {
  await threadStore.editThread({
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

commonStore.setReady();
</script>

<template>
  <div v-if="commonStore.isReady" class="col-full push-top">
    <h1>Editing <i v-text="thread.title" /></h1>

    <thread-editor
      v-model:is-dirty="hasDirtyForm"
      :title="thread.title"
      :text="firstPostText"
      @save="save"
      @cancel="cancel"
    />
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
