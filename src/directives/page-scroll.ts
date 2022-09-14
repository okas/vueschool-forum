import { useThrottleFn } from "@vueuse/shared";
import { App, DirectiveBinding } from "vue";

type ExtendedHTMLElement = HTMLElement & {
  __page_scroll_handler__: () => void;
};

export default (app: App) => {
  app.directive("page-scroll", {
    mounted(el: ExtendedHTMLElement, binding: DirectiveBinding) {
      el.__page_scroll_handler__ = useThrottleFn(binding.value, 1000);

      document.addEventListener("scroll", el.__page_scroll_handler__);
    },

    unmounted(el: ExtendedHTMLElement) {
      document.removeEventListener("scroll", el.__page_scroll_handler__);
    },
  });
};
