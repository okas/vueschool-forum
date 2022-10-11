<script setup lang="ts">
export interface IHitData {
  webformatURL: string;
}

import { createFetch, CreateFetchOptions } from "@vueuse/core";
import { computed, watch } from "vue";

interface IWordsResp {
  word: string;
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

const emits = defineEmits<{
  (e: "start"): void;
  (e: "hit", dto: IHitData): void;
}>();

const useWordsApi = createFetch(wordsApiConf);
const useImagesApi = createFetch(imagesApiConf);

const { execute: execWordsReq, data: wordData } = useWordsApi<IWordsResp>(`randomword`, {
  immediate: false,
  refetch: true,
}).json<IWordsResp>();

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

watch(imageData, (newImageData) => {
  if (!newImageData.total) {
    execWordsReq();
  } else {
    emits("hit", newImageData.hits[0]);
  }
});

function getRandomImage() {
  emits("start");
  execWordsReq();
}
</script>

<template>
  <div class="text-center random-avatar-picker">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
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
