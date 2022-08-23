import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { App } from "vue";

export default async function fontAwesomePlugin(
  app: App<Element>,
  componentName?: string
) {
  library.add(...(await getIconDefinitions()));

  app.component(componentName ?? "Fa", FontAwesomeIcon);
}

async function getIconDefinitions(): Promise<IconDefinition[]> {
  const freeSolidIcons = await import("@fortawesome/free-solid-svg-icons").then(
    (module) => {
      // Expand this array with required icons from module.
      return [module.faPencilAlt];
    }
  );
  // If there are icons form other FA module, then add dynamic import statement
  // with icon definitions array as a return; then just spread them
  // to below return array.
  return [...freeSolidIcons];
}
