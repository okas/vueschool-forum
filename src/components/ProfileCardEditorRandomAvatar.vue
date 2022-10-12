<script setup lang="ts">
import { createFetch, useFetch, type CreateFetchOptions } from "@vueuse/core";
import { computed, watch } from "vue";

interface IWordsResp {
  word: string;
}

interface IHitData {
  id: number;
  webformatURL: string;
  webformatWidth: number;
  tags: string;
}

interface IPixabayResp {
  total: number;
  hits: Array<IHitData>;
}

const wordsApiConf: CreateFetchOptions = {
  baseUrl: "https://api.api-ninjas.com/v1",
  fetchOptions: {
    headers: { "X-Api-Key": "uWV4CK7zOR8VZJk46MtyQA==CHDdcNoSOsj5GZgN" },
  },
};

const imagesApiConf: CreateFetchOptions = {
  baseUrl: "https://pixabay.com/api",
};

const imagesApiKey = "30503892-e453399cd8db88ca76c1b7ec6";

defineProps<{
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: "start"): void;
  (e: "hit", blob: File): void;
}>();

const useWordsApi = createFetch(wordsApiConf);
const useImagesApi = createFetch(imagesApiConf);

const { execute: execWordsReq, data: wordData } = useWordsApi<IWordsResp>(
  `randomword`,
  {
    immediate: false,
    refetch: true,
  }
).json<IWordsResp>();

const imageApiUrl = computed(
  () =>
    `?key=${imagesApiKey}&per_page=${3}&safesearch=true&q=${
      wordData.value?.word ?? "alfa"
    }`
);

const { data: imageData } = useImagesApi<IPixabayResp>(imageApiUrl, {
  immediate: false,
  refetch: true,
}).json<IPixabayResp>();

watch(imageData, async (newImageData) => {
  if (!newImageData.total) {
    execWordsReq();
  } else {
    const file = await downloadFile(newImageData);

    emits("hit", file);
  }
});

function getRandomImage() {
  emits("start");
  execWordsReq();
}

async function downloadFile({ hits: [firstHit] }: IPixabayResp): Promise<File> {
  const { data: blob } = await useFetch(firstHit.webformatURL).blob();

  return new File([blob.value], getFileName(firstHit), {
    type: "image/jpg",
  });
}

function getFileName({ id, webformatWidth, tags }: IHitData): string {
  return `${id}_${tags
    .split(",")
    .map((tag) => tag.trim().replace(" ", "-"))
    .join("_")}_${webformatWidth}.jpg`;
}
</script>

<template>
  <div class="text-center random-avatar-picker">
    <button
      class="btn-green btn-xsmall"
      :disabled="disabled"
      @click.prevent="getRandomImage"
    >
      Random Avatar
    </button>

    <br />

    <small class="pixabay-credit">
      Powered by <a href="https://pixabay.com">Pixabay</a>
    </small>
  </div>
</template>

<style scoped>
.random-avatar-picker {
  margin-bottom: 1rem;
}

.pixabay-credit {
  opacity: 0.5;
}
</style>
