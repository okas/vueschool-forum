import { createPinia } from "pinia";
import { Component, createApp, Plugin } from "vue";
import AppRoot from "./App.vue";
import clickOutsideDirective from "./directives/click-outside";
import pageScrollDirective from "./directives/page-scroll";
import { useFontAwesomePlugin } from "./plugins/font-awesome";
import router from "./router";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const forumApp = createApp(AppRoot);
let faPlugin: Plugin;

async function loadAsyncDependencies() {
  faPlugin = await useFontAwesomePlugin();
}

function loadPlugins() {
  forumApp.use(createPinia()).use(router).use(faPlugin);
}

function loadDirectives() {
  forumApp.use(clickOutsideDirective).use(pageScrollDirective);
}

function loadGlobalComponents() {
  const modules: Record<string, Component & { __name: string }> =
    import.meta.glob("@/components/App*.vue", {
      import: "default",
      eager: true,
    });

  for (const path in modules) {
    forumApp.component(modules[path].__name, modules[path]);
  }
}

loadAsyncDependencies()
  .then(loadPlugins)
  .then(loadDirectives)
  .then(loadGlobalComponents)
  .then(() => forumApp.mount("#app"));
