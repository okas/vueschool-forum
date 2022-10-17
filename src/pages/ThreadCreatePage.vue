<script setup lang="ts">
import ModalDialog from "@/components/ModalDialog.vue";
import ThreadEditor from "@/components/ThreadEditor.vue";
import type { ForumVM } from "@/models/ForumVM";
import { useCommonStore } from "@/stores/common-store";
import { useForumStore } from "@/stores/forum-store";
import { useThreadStore } from "@/stores/thread-store";
import type { ThreadVMFormInput } from "@/types/threadVm-types";
import { findById } from "@/utils/array-helpers";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  forumId: string;
}>();

const commonStore = useCommonStore();
const forumStore = useForumStore();
const threadStore = useThreadStore();

const router = useRouter();

const hasDirtyForm = ref<boolean>(false);

const forum = computed<ForumVM | undefined>(() =>
  findById(forumStore.items, props.forumId)
);

async function save(dto?: ThreadVMFormInput) {
  if (!dto) {
    return;
  }

  const threadId = await threadStore.createThread({
    forumId: props.forumId,
    title: dto.text,
    text: dto.text,
  });

  router.push({ name: "Thread", params: { threadId } });
}

function cancel() {
  router.push({ name: "Forum", params: { forumId: props.forumId } });
}

commonStore.setReady();
</script>

<template>
  <div v-if="commonStore.isReady" class="col-full push-top">
    <h1>
      Create new thread in
      <i v-text="forum?.name" />
    </h1>

    <thread-editor v-model:is-dirty="hasDirtyForm" @save="save" @cancel="cancel" />
  </div>

  <modal-dialog :reveal-condition="hasDirtyForm" />
</template>
