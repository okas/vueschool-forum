import { App, DirectiveBinding } from "vue";

function getHandler(
  el: HTMLElement,
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
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      document.body.onclick = getHandler(el, binding);
    },

    unmounted() {
      document.body.onclick = null;
    },
  });
};
