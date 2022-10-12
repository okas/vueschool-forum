import {
  library,
  type IconDefinition,
} from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { App } from "vue";

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
  // If there are icons form other FA module, then add dynamic import statement
  // with icon definitions array as a return
  const freeSolid = await import("@fortawesome/free-solid-svg-icons").then(
    (m) => {
      return [
        m.faPencilAlt,
        m.faSpinner,
        m.faLocationDot,
        m.faGlobe,
        m.faCircleUser,
        m.faPaperPlane,
        m.faXmark,
        m.faCamera,
        m.faImagePortrait,
      ];
    }
  );

  const freeBrand = await import("@fortawesome/free-brands-svg-icons").then(
    (m) => {
      return [m.faTwitter];
    }
  );

  return [...freeSolid, ...freeBrand];
}
