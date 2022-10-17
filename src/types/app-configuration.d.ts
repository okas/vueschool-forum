import type { FirebaseOptions } from "@firebase/app";

export interface IAppConfiguration {
  firebase: FirebaseOptions;
  avatarRandomPicker: {
    wordsApi: {
      baseUrl: string;
      headers: {
        apiKey: string;
      };
      apiKey;
    };
    imagesApi: {
      baseUrl: string;
      headers?: Record<string, string>;
      apiKey: string;
    };
  };
}
