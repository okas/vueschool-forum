import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  START_LOCATION,
} from "vue-router";
import { useMainStore } from "./../stores/main-store";
import { rawRoutes } from "./raw-routes";

function getRouteRecords(
  input: Readonly<RouteRecordRaw[]>
): Readonly<RouteRecordRaw[]> {
  return input.map(({ meta = {}, ...rest }) => {
    Object.assign(meta, {
      toTop: true,
      smoothScroll: true,
    });

    return { ...rest, meta };
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

router.beforeEach((to, from): RouteLocationRaw | undefined => {
  const store = useMainStore();

  from !== START_LOCATION && store.clearDbSubscriptions();

  return to.meta?.requiresAuth && !store.authUserId
    ? { name: "Home" }
    : undefined;
});

export default router;
