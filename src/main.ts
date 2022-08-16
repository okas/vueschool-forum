import { initializeApp } from "firebase/app";
import { createPinia } from "pinia";
import { createApp } from "vue";
import AppRoot from "./App.vue";
import firebaseConfig from "./config/firebase";
import router from "./router";
import registerGlobalComponents from "./utils/useAutoComponentRegistrator";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const app = initializeApp(firebaseConfig);

const forumApp = createApp(AppRoot);

forumApp
  .use(createPinia())
  .use(router)
  .use(registerGlobalComponents, {
    loader: () =>
      // Webpack specific!
      // In case of Vite/Rollup there is builtin glob importer.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require.context("@/components/", true, /App[A-Z]\w+\.(vue|js)$/),
  });

forumApp.mount("#app");
