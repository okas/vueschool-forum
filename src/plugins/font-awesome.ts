import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { App } from "vue";

export async function useFontAwesomePlugin() {
  const appIconDefinitions = await getIconDefinitions();

  return {
    install(app: App<Element>, componentName?: string) {
      library.add(...appIconDefinitions);

      app.component(componentName ?? "Fa", FontAwesomeIcon);
    },
  };
}

async function getIconDefinitions(): Promise<IconDefinition[]> {
  const freeSolidIcons = await import("@fortawesome/free-solid-svg-icons").then(
    (module) => {
      // Expand this array with required icons from module.
      return [module.faPencilAlt, module.faSpinner];
    }
  );
  // If there are icons form other FA module, then add dynamic import statement
  // with icon definitions array as a return; then just spread them
  // to below return array.
  return [...freeSolidIcons];
}
