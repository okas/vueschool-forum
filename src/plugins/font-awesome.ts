import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faCamera,
  faCircleUser,
  faComment,
  faComments,
  faGlobe,
  faImagePortrait,
  faLocationDot,
  faPaperPlane,
  faPencilAlt,
  faSpinner,
  faUser,
  faUserCircle,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { App } from "vue";

export async function useFontAwesomePlugin() {
  return {
    install(app: App<Element>, componentName?: string) {
      library.add(
        faPencilAlt,
        faSpinner,
        faLocationDot,
        faGlobe,
        faCircleUser,
        faPaperPlane,
        faXmark,
        faCamera,
        faImagePortrait,
        faUserCircle,
        faUser,
        faComments,
        faComment,
        faTwitter
      );

      app.component(componentName ?? "Fa", FontAwesomeIcon);
    },
  };
}
