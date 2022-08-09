import { createApp } from "vue";
import AppRoot from "./App.vue";
import router from "./router";
import registerGlobalComponents from "./utils/useAutoComponentRegistrator";

const forumApp = createApp(AppRoot);

forumApp.use(router);

forumApp.use(registerGlobalComponents, {
  loader: () =>
    // Webpack specific!
    // In case of Vite/Rollup there is builtin glob importer.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    require.context("@/components/", true, /App[A-Z]\w+\.(vue|js)$/),
});

forumApp.mount("#app");
