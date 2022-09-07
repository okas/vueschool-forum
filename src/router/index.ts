import { useAuth } from "@vueuse/firebase/useAuth";
import { watch } from "vue";
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  START_LOCATION,
} from "vue-router";
import { fabAuth } from "../firebase";
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

watch(useAuth(fabAuth).isAuthenticated, async (is) => {
  const store = useMainStore();

  if (is) {
    await store.fetchAuthUser();
  } else {
    store.clearDbSubscriptionAuthUser();
    store.authUserId = null;
  }
});

const router = createRouter({
  routes: getRouteRecords(rawRoutes),
  scrollBehavior,
  history: createWebHistory(),
});

router.beforeEach(async (to, from): Promise<RouteLocationRaw | undefined> => {
  const store = useMainStore();

  from !== START_LOCATION && store.clearDbSubscriptions();

  store.clearDbSubscriptionAuthUser();

  if (useAuth(fabAuth).isAuthenticated) {
    await store.fetchAuthUser();
  }

  return to.meta?.requiresAuth && !store.authUserId
    ? { name: "Home" }
    : undefined;
});

export default router;
