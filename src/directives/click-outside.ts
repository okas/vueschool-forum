import { App, DirectiveBinding } from "vue";

type ExtendedHTMLElement = HTMLElement & {
  __click_outside_handler__: (event: MouseEvent) => void;
};

function getHandler(
  el: ExtendedHTMLElement,
  binding: DirectiveBinding
): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    if (el === event.target || el.contains(event.target as Node)) {
      return;
    }
    binding.value(event);
  };
}

export default (app: App) => {
  app.directive("click-outside", {
    mounted(el: ExtendedHTMLElement, binding: DirectiveBinding) {
      el.__click_outside_handler__ = getHandler(el, binding);

      document.body.addEventListener("click", el.__click_outside_handler__);
    },

    unmounted(el: ExtendedHTMLElement) {
      document.body.removeEventListener("click", el.__click_outside_handler__);
    },
  });
};
