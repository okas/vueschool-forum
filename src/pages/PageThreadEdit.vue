<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import ThreadEditor from "../components/ThreadEditor.vue";
import { useMainStore } from "../store/index";
import { ThreadVMFormInput } from "../types/ThreadVMTypes";

const props = defineProps<{
  threadId: string;
}>();

const store = useMainStore();
const router = useRouter();

const thread = computed(() =>
  store.threads.find(({ id }) => id === props.threadId)
);

const firstPostText = computed(
  () => store.posts.find(({ id }) => id === thread.value.posts[0]).text
);

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
  router.push({ name: "ThreadShow", params: { threadId: props.threadId } });
}
</script>

<template>
  <div class="col-full push-top">
    <h1>Editing <i v-text="thread.title" /></h1>

    <thread-editor
      :title="thread.title"
      :text="firstPostText"
      @save="save"
      @cancel="cancel"
    />
  </div>
</template>

<style scoped></style>
