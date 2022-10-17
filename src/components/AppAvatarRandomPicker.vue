<script setup lang="ts">
import useAppConfig from "@/app-config";
import type { IFileInfo } from "@/types/avatar-utility-types";
import {
  createFetch,
  get,
  promiseTimeout,
  useFetch,
  type UseFetchReturn,
} from "@vueuse/core";
import { computed, onUnmounted, reactive, watch } from "vue";

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

defineProps<{
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: "start"): void;
  (e: "filePicked", dto: IFileInfo | undefined): void;
}>();

const {
  avatarRandomPicker: { wordsApi, imagesApi },
} = useAppConfig();

const useWordsApi = createFetch({
  baseUrl: wordsApi.baseUrl,
  fetchOptions: {
    headers: { [wordsApi.headers.apiKey]: wordsApi.apiKey },
  },
});
const useImagesApi = createFetch({
  baseUrl: imagesApi.baseUrl,
});

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
    `?key=${imagesApi.apiKey}&per_page=${3}&safesearch=true&q=${
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
  const blobFetchResult = await tryFetchLimitedTimes(firstHit.webformatURL);

  if (!blobFetchResult?.data.value || !blobFetchResult.response.value) {
    return undefined;
  }

  const { data, response } = blobFetchResult;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const file = createFileObj(get(data)!, get(response)!.headers, firstHit);

  return file;
}

function createFileObj(blob: Blob, headers: Headers, firstHit: IHitData) {
  const rawLastModified = headers.get("last-modified");
  const lastModified = rawLastModified
    ? new Date(rawLastModified).getTime()
    : undefined;
  const type = blob.type;
  const fileName = getFileName(firstHit, type);

  return new File([blob], fileName, { lastModified, type });
}

async function tryFetchLimitedTimes(
  url: string,
  retries = 3
): Promise<UseFetchReturn<Blob> | undefined> {
  let fetchResult: UseFetchReturn<Blob> | undefined;

  while (retries--) {
    fetchResult = await useFetch(url).blob();

    if (fetchResult.data.value) {
      break;
    } else {
      await promiseTimeout(1000);
    }
  }

  return fetchResult;
}

function getFileName(
  { id, webformatWidth, tags }: IHitData,
  contentType: string
): string {
  const tagsCombined = tags
    .split(",")
    .map((tag) => tag.trim().replace(" ", "-"))
    .join("_");

  const ext = contentType.split("/").at(-1);

  return `${id}_${tagsCombined}_${webformatWidth}.${ext}`;
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
