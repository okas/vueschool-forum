import { useCategoryStore } from "@/stores/category-store";
import { useCommonStore } from "@/stores/common-store";
import { useForumStore } from "@/stores/forum-store";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import { useUserStore } from "@/stores/user-store";
import type { UserStoreActions } from "@/types/user-store-types";
import {
  START_LOCATION,
  type NavigationGuardWithThis,
  type NavigationHookAfter,
  type RouteLocationNormalized,
  type RouteLocationRaw,
} from "vue-router";

export const beforeEachGuard: NavigationGuardWithThis<undefined> = async (
  to,
  from
): Promise<RouteLocationRaw | undefined> => {
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
};

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

export const afterEachGuard: NavigationHookAfter = () => {
  const commonStore = useCommonStore();

  // If any component of current rout is still loading,
  // then the component must set state by itself.
  // This allows to prolonged loading indicators action.
  commonStore.isLoading || commonStore.setReady(true);
};
