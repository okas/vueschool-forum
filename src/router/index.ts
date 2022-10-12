import {
  createRouter,
  createWebHistory,
  START_LOCATION,
  type RouteLocationNormalized,
  type RouteLocationRaw,
  type RouteRecordRaw,
} from "vue-router";
import { useThreadStore } from "../stores/thread-store";
import { useCategoryStore } from "./../stores/category-store";
import { useForumStore } from "./../stores/forum-store";
import { usePostStore } from "./../stores/post-store";
import { useUserStore } from "./../stores/user-store";
import type { UserStoreActions } from "./../types/user-store-types";
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

router.beforeEach(async (to, from): Promise<RouteLocationRaw | undefined> => {
  const userStore = useUserStore();

  if (from !== START_LOCATION) {
    userStore.clearDbSubscriptions();
    usePostStore().clearDbSubscriptions();
    useForumStore().clearDbSubscriptions();
    useThreadStore().clearDbSubscriptions();
    useCategoryStore().clearDbSubscriptions();
  }

  return await verifyGuardedRoute(userStore, to);
});

async function verifyGuardedRoute(
  store: UserStoreActions,
  to: RouteLocationNormalized
): Promise<RouteLocationRaw | undefined> {
  const isAuthenticated = await store.forceInitFireBaseAuthState();

  return to.meta?.requiresAuth && !isAuthenticated
    ? {
        name: "SignIn",
        query: {
          redirectTo: to.path,
        },
      }
    : to.meta?.requiresGuest && isAuthenticated
    ? { name: "Home" }
    : undefined;
}

export default router;
