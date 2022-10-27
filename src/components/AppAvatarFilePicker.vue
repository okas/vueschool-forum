<script setup lang="ts">
import { useCommonStore } from "@/stores/common-store";
import type { IFileInfo } from "@/types/avatar-utility-types";
import { useFileDialog } from "@vueuse/core";
import { computed, onUnmounted, reactive, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    avatarSrc?: string | undefined;
    multiple?: boolean;
    accept?: string;
  }>(),
  {
    title: "Avatar",
    avatarSrc: undefined,
    multiple: false,
    accept: "image/*",
  }
);

const emits = defineEmits<{
  (e: "imgLoaded"): void;
  (e: "filePicked", dto: IFileInfo): void;
}>();

const commonStore = useCommonStore();

const { files, open } = useFileDialog();

const avatarPreviewImgDataUrl = ref<string | undefined>();

const createdObjectUrls = reactive<Array<string>>([]);

const singleFile = computed<File | undefined>(() => files.value?.item(0) ?? undefined);

watch(singleFile, async (newFile) => {
  if (!newFile) {
    return;
  }

  const objUrl = URL.createObjectURL(newFile);

  avatarPreviewImgDataUrl.value = objUrl;
  createdObjectUrls.push(objUrl);

  emits("filePicked", { file: newFile, objUrl });
});

onUnmounted(() => createdObjectUrls.forEach((url) => URL.revokeObjectURL(url)));

function openDialog() {
  open({ accept: props.accept, multiple: props.multiple });
}
</script>

<template>
  <div class="avatar-edit">
    <app-avatar-img
      :src="avatarSrc"
      class="avatar-xlarge img-update"
      :title="title"
      @click.prevent="openDialog"
      @load="emits('imgLoaded')"
    />

    <div class="avatar-upload-overlay" :title="title" @click="openDialog">
      <slot>
        <fa icon="camera" size="3x" inverse />
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.avatar-edit {
  position: relative;

  * {
    cursor: v-bind("commonStore.isLoading ? 'auto ' : 'pointer'");
  }
}

.avatar-upload-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
