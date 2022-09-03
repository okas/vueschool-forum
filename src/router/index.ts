import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
  START_LOCATION,
} from "vue-router";
import { useMainStore } from "./../stores/main-store";
import { rawRoutes } from "./raw-routes";

function getRouteRecords(
  input: Readonly<RouteRecordRaw[]>
): Readonly<RouteRecordRaw[]> {
  return input.map((rawRoute) => {
    rawRoute.meta = { toTop: true, smoothScroll: true };
    return rawRoute;
  });
}

function scrollBehavior(to: RouteLocationNormalized): Promise<ScrollToOptions> {
  const conditionalOptions: ScrollToOptions = {
    top: to.meta.toTop ? 0 : undefined,
    behavior: to.meta.smoothScroll ? "smooth" : undefined,
  };

  return new Promise((resolve) =>
    setTimeout(() => resolve(conditionalOptions), 100)
  );
}

const router = createRouter({
  routes: getRouteRecords(rawRoutes),
  scrollBehavior,
  history: createWebHistory(),
});

router.beforeEach((_, from) => {
  from !== START_LOCATION && useMainStore().clearDbSubscriptions();
});

export default router;
