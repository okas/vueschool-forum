import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";

const forumApp = createApp(App);

forumApp.use(router);
registerGlobalComponents(forumApp);

forumApp.mount("#app");

/********************/

function registerGlobalComponents(app) {
  // Webpack specific!
  // In case of Vite/Rollup there is builtin glob importer.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const requireComponent = require.context(
    "./components/",
    true,
    /App[A-Z]\w+\.(vue|js)$/
  );

  requireComponent.keys().forEach((fileName: string) => {
    let baseComponentConfig = requireComponent(fileName);
    baseComponentConfig = baseComponentConfig.default || baseComponentConfig;

    const baseComponentName =
      baseComponentConfig.name ||
      fileName.replace(/^.+\//, "").replace(/\.\w+$/, "");

    app.component(baseComponentName, baseComponentConfig);
  });
}
