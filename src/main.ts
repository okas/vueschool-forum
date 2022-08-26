import { createPinia } from "pinia";
import { createApp } from "vue";
import AppRoot from "./App.vue";
import fontAwesomePlugin from "./plugins/font-awesome";
import router from "./router";
import registerGlobalComponents from "./utils/useAutoComponentRegistrator";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  })
  .use(fontAwesomePlugin);

forumApp.mount("#app");
