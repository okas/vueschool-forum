<script setup lang="ts">
import type { IFileInfo } from "@/types/avatar-utility-types";
import {
  createFetch,
  promiseTimeout,
  useFetch,
  type CreateFetchOptions,
} from "@vueuse/core";
import { computed, onUnmounted, reactive, unref, watch } from "vue";

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

//TODO: externalize API keys!

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
  (e: "filePicked", dto: IFileInfo | undefined): void;
}>();

const useWordsApi = createFetch(wordsApiConf);
const useImagesApi = createFetch(imagesApiConf);

const createdObjectUrls = reactive<Array<string>>([]);

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
      wordData.value?.word ?? "alpha"
    }`
);

const { data: imageInfo } = useImagesApi<IPixabayResp>(imageApiUrl, {
  immediate: false,
  refetch: true,
}).json<IPixabayResp>();

watch(imageInfo, async (updatedImageInfo) => {
  if (!updatedImageInfo?.total) {
    execWordsReq();
  } else {
    emits("filePicked", await tryGetAvatarImage(updatedImageInfo));
  }
});

onUnmounted(() => createdObjectUrls.forEach((url) => URL.revokeObjectURL(url)));

function getRandomImage() {
  emits("start");
  execWordsReq();
}

async function tryGetAvatarImage(
  input: IPixabayResp
): Promise<IFileInfo | undefined> {
  const file = await downloadImage(input);

  if (!file) {
    return;
  }

  const objUrl = URL.createObjectURL(file);

  createdObjectUrls.push(objUrl);

  return { file, objUrl };
}

async function downloadImage({
  hits: [firstHit],
}: IPixabayResp): Promise<File | undefined> {
  const blob = await tryFetchLimitedTimes(firstHit.webformatURL);

  if (!blob) {
    return undefined;
  }

  return new File([blob], getFileName(firstHit), {
    type: "image/jpg", // TODO: detect real type; or drop the extension?
  });
}

async function tryFetchLimitedTimes(
  url: string,
  retries = 3
): Promise<Blob | undefined> {
  let result: Blob | undefined;

  while (retries--) {
    const fetchResp = unref(useFetch(url).blob().data) ?? undefined;

    if (fetchResp) {
      break;
    } else {
      await promiseTimeout(100);
    }
  }

  return result;
}

function getFileName({ id, webformatWidth, tags }: IHitData): string {
  const tagsCombined = tags
    .split(",")
    .map((tag) => tag.trim().replace(" ", "-"))
    .join("_");

  return `${id}_${tagsCombined}_${webformatWidth}.jpg`;
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
