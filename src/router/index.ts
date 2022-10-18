import { useCategoryStore } from "@/stores/category-store";
import { useCommonStore } from "@/stores/common-store";
import { useForumStore } from "@/stores/forum-store";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import { useUserStore } from "@/stores/user-store";
import type { UserStoreActions } from "@/types/user-store-types";
import {
  createRouter,
  createWebHistory,
  START_LOCATION,
  type RouteLocationNormalized,
  type RouteLocationRaw,
  type RouteMeta,
  type RouteRecordRaw,
} from "vue-router";
import { rawRoutes } from "./raw-routes";

function getRouteRecords(
  input: Readonly<RouteRecordRaw[]>
): Readonly<RouteRecordRaw[]> {
  const defaultMeta: RouteMeta = {
    toTop: true,
    smoothScroll: true,
    transitionName: "fade",
  };

  return input.map(({ meta, ...restRoute }) => ({
    ...restRoute,
    meta: Object.assign({}, defaultMeta, meta),
  }));
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

  if (from.name !== to.name) {
    useCommonStore().setLoading();
  }

  if (from !== START_LOCATION) {
    userStore.clearDbSubscriptions();
    usePostStore().clearDbSubscriptions();
    useForumStore().clearDbSubscriptions();
    useThreadStore().clearDbSubscriptions();
    useCategoryStore().clearDbSubscriptions();
  }

  return await verifyGuardedRoute(userStore, to);
});

router.afterEach(() => {
  const commonStore = useCommonStore();

  // If any component of current rout is still loading,
  // then the component must set state by itself.
  // This allows to prolonged loading indicators action.
  commonStore.isLoading || commonStore.setReady(true);
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
