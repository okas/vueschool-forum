import firebaseConfig from "@/app-config/firebase.js";
import type { IAppConfiguration } from "@/types/app-configuration";
import { reactive, readonly } from "vue";

export default function useAppConfig(): IAppConfiguration {
  return appConfig;
}

const appConfig = readonly(
  reactive<IAppConfiguration>({
    firebase: firebaseConfig,
    avatarRandomPicker: {
      wordsApi: {
        baseUrl: "https://api.api-ninjas.com/v1",
        headers: {
          apiKey: "X-Api-Key",
        },
        apiKey: "uWV4CK7zOR8VZJk46MtyQA==CHDdcNoSOsj5GZgN",
      },
      imagesApi: {
        baseUrl: "https://pixabay.com/api",
        apiKey: "30503892-e453399cd8db88ca76c1b7ec6",
      },
    },
  })
);
