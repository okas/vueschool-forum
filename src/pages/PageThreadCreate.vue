<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";
import { computed, provide, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import ModalDialog, { confirmInjectKey } from "../components/ModalDialog.vue";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useCommonStore } from "../stores/common-store";
import { useForumStore } from "../stores/forum-store";
import { useThreadStore } from "../stores/threads-store";
import { ThreadVMFormInput } from "../types/threadVm-types";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const commonStore = useCommonStore();
const forumStore = useForumStore();
const threadStore = useThreadStore();

const router = useRouter();

const { isRevealed, reveal, confirm } = useConfirmDialog();

const hasDirtyForm = ref<boolean>(false);

const forum = computed(() => findById(forumStore.forums, props.forumId));

provide(confirmInjectKey, confirm);

onBeforeRouteLeave(async () => {
  if (hasDirtyForm.value) {
    return (await reveal()).data;
  }
});

async function save({ title, text }: ThreadVMFormInput) {
  const threadId = await threadStore.createThread({
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

commonStore.setReady();
</script>

<template>
  <div v-if="commonStore.isReady" class="col-full push-top">
    <h1>
      Create new thread in
      <i v-text="forum.name" />
    </h1>

    <thread-editor
      v-model:is-dirty="hasDirtyForm"
      @save="save"
      @cancel="cancel"
    />
  </div>

  <modal-dialog v-if="isRevealed" />
</template>
