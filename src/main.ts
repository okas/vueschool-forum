import { createPinia } from "pinia";
import { createApp } from "vue";
import AppRoot from "./App.vue";
import clickOutsideDirective from "./directives/click-outside";
import pageScrollDirective from "./directives/page-scroll";
import { useFontAwesomePlugin } from "./plugins/font-awesome";
import V3Pagination from "./plugins/vue3-pagination";
import router from "./router";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const forumApp = createApp(AppRoot);

async function loadPlugins() {
  forumApp
    .use(createPinia())
    .use(router)
    .use(await useFontAwesomePlugin())
    .use(V3Pagination);
}

function loadDirectives() {
  forumApp.use(clickOutsideDirective).use(pageScrollDirective);
}

loadPlugins()
  .then(loadDirectives)
  .then(() => forumApp.mount("#app"));
