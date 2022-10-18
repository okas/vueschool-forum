import type { RouteLocationNormalized } from "vue-router";

export default function scrollBehavior(
  to: RouteLocationNormalized
): Promise<ScrollToOptions> {
  const conditionalOptions: ScrollToOptions = {
    top: to.meta.toTop ? 0 : undefined,
    behavior: to.meta.smoothScroll ? "smooth" : undefined,
  };

  return new Promise((resolve) =>
    setTimeout(() => resolve(conditionalOptions), 200)
  );
}
