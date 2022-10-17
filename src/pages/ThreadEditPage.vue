<script setup lang="ts">
import ThreadEditor from "@/components/ThreadEditor.vue";
import type { ThreadVM } from "@/models/ThreadVM";
import { useCommonStore } from "@/stores/common-store";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import type { ThreadVMFormInput } from "@/types/threadVm-types";
import { findById } from "@/utils/array-helpers";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  threadId: string;
}>();

const postStore = usePostStore();
const commonStore = useCommonStore();
const threadStore = useThreadStore();

const router = useRouter();

const hasDirtyForm = ref<boolean>(false);

const thread = computed<ThreadVM | undefined>(() =>
  findById(threadStore.items, props.threadId)
);

const firstPostText = computed<string | undefined>(
  () => findById(postStore.items, thread.value?.firstPostId)?.text
);

async function save(dto?: ThreadVMFormInput) {
  if (dto) {
    await threadStore.editThread({
      id: props.threadId,
      ...dto,
    });
  }

  functionGoToThread();
}

function cancel() {
  functionGoToThread();
}

function functionGoToThread() {
  router.push({ name: "Thread", params: { threadId: props.threadId } });
}

commonStore.setReady();
</script>

<template>
  <div v-if="commonStore.isReady" class="col-full push-top">
    <h1>Editing <i v-text="thread?.title" /></h1>

    <thread-editor
      v-model:is-dirty="hasDirtyForm"
      :title="thread?.title"
      :text="firstPostText"
      @save="save"
      @cancel="cancel"
    />
  </div>

  <app-nav-confirmation-modal :reveal-condition="hasDirtyForm" />
</template>
