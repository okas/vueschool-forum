<script setup lang="ts">
import { useRouter } from "vue-router";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useMainStore } from "../store/index";
import { ThreadVMFormInput } from "../types/ThreadVMTypes";
import { findById } from "../utils/array-helpers";

const props = defineProps<{
  forumId: string;
}>();

const router = useRouter();

const { name: forumName } = findById(useMainStore().forums, props.forumId);

async function save({ title, text }: ThreadVMFormInput) {
  const threadId = await useMainStore().createThread({
    forumId: props.forumId,
    title,
    text,
  });

  router.push({ name: "ThreadShow", params: { threadId } });
}

function cancel() {
  router.push({ name: "Forum", params: { forumId: props.forumId } });
}
</script>

<template>
  <div class="col-full push-top">
    <h1>
      Create new thread in
      <i v-text="forumName" />
    </h1>

    <thread-editor @save="save" @cancel="cancel" />
  </div>
</template>

<style scoped></style>
