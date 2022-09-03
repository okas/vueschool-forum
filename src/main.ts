import { useAuth } from "@vueuse/firebase/useAuth";
import { createPinia } from "pinia";
import { createApp, Plugin, watch } from "vue";
import AppRoot from "./App.vue";
import { firebaseAuth } from "./firebase";
import { useFontAwesomePlugin } from "./plugins/font-awesome";
import router from "./router";
import { useMainStore } from "./stores/main-store";
import registerGlobalComponents, {
  Options,
} from "./utils/useAutoComponentRegistrator";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const forumApp = createApp(AppRoot);
let faPlugin: Plugin;

async function loadAsyncDependencies() {
  faPlugin = await useFontAwesomePlugin();
}

const registerComponentsOptions: Options = {
  loader: () =>
    // Webpack specific!
    // In case of Vite/Rollup there is builtin glob importer.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    require.context("@/components/", true, /App[A-Z]\w+\.(vue|js)$/),
};

function bootstrapApp() {
  forumApp
    .use(createPinia())
    .use(router)
    .use(registerGlobalComponents, registerComponentsOptions)
    .use(faPlugin);

  forumApp.mount("#app");
}

watch(
  useAuth(firebaseAuth).isAuthenticated,
  async (is) => is && (await useMainStore().fetchAuthUser())
);

loadAsyncDependencies().then(bootstrapApp);
