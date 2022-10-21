import { promiseTimeout } from "@vueuse/shared";
import type { RouteLocationNormalized, RouteMeta } from "vue-router";

export type ExtendedMeta = RouteMeta & {
  scroll?: ScrollToOptions;
};

export type AppRouteLocationNormalized = RouteLocationNormalized & {
  meta?: ExtendedMeta;
};

export default async function scrollBehavior({
  meta: { scroll },
  hash,
}: AppRouteLocationNormalized): Promise<ScrollToOptions> {
  // NB! Pay attention to the route level transitions!
  // If route level transitions have duration roughly the same or longer,
  // this delay will not be visible, because it happens soone.
  await promiseTimeout(300);

  return {
    top: scroll?.top ?? undefined,
    behavior: scroll?.behavior ? "smooth" : undefined,
    ...(hash ? { el: hash } : undefined),
  };
}
