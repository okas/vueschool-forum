<script setup lang="ts">
import ThreadEditor from "@/components/ThreadEditor.vue";
import type { ForumVM } from "@/models/ForumVM";
import { useCommonStore } from "@/stores/common-store";
import { useForumStore } from "@/stores/forum-store";
import { useThreadStore } from "@/stores/thread-store";
import type { ThreadVMFormInput } from "@/types/threadVm-types";
import { findById } from "@/utils/array-helpers";
import { getValOrFirst } from "@/utils/misc";
import { computed, ref } from "vue";
import { useRoute, useRouter, type RouteLocationRaw } from "vue-router";

const props = defineProps<{
  forumId: string;
}>();

const commonStore = useCommonStore();
const forumStore = useForumStore();
const threadStore = useThreadStore();

const router = useRouter();
const route = useRoute();

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
  const goToRoute: RouteLocationRaw = getValOrFirst(
    route.query.returnOnCancel
  ) ?? {
    name: "Forum",
    params: { forumId: props.forumId },
  };

  router.push(goToRoute);
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

  <app-nav-confirmation-modal :reveal-condition="hasDirtyForm" />
</template>
