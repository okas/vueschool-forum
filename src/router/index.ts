import {
  createRouter,
  createWebHistory,
  RouteLocation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
} from "vue-router";
import { useMainStore } from "../stores/main-store";
import { HasId } from "../types/HasId";

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../pages/PageRegister.vue"),
  },
  {
    path: "/me",
    name: "Profile",
    component: () => import("../pages/PageProfile.vue"),
    meta: { toTop: true, smoothScroll: true },
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) =>
      next(
        testForNotFound(
          routeObj,
          useMainStore().users,
          useMainStore().authUserId
        )
      ),
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    component: () => import("../pages/PageProfile.vue"),
    props: { edit: true },
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) =>
      next(
        testForNotFound(
          routeObj,
          useMainStore().users,
          useMainStore().authUserId
        )
      ),
  },
  {
    path: "/category/:categoryId",
    name: "Category",
    component: () => import("../pages/PageCategory.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) =>
      next(testForNotFound(routeObj, useMainStore().categories, "categoryId")),
  },
  {
    path: "/forum/:forumId",
    name: "Forum",
    component: () => import("../pages/PageForum.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useMainStore().forums, "forumId")),
  },
  {
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    component: () => import("../pages/PageThreadCreate.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useMainStore().forums, "forumId")),
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    component: () => import("../pages/PageThreadEdit.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useMainStore().threads, "threadId")),
  },
  {
    path: "/thread/:threadId",
    name: "ThreadShow",
    component: () => import("../pages/PageThread.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useMainStore().threads, "threadId")),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/PageNotFound.vue"),
  },
];

function testForNotFound<TViewModel extends HasId>(
  { params, path, query, hash }: RouteLocation,
  array: Array<TViewModel>,
  paramKeyOrIdValue: string
): RouteLocationRaw | undefined {
  return array.some(
    ({ id }) => id === (params[paramKeyOrIdValue] ?? paramKeyOrIdValue)
  )
    ? undefined
    : {
        name: "NotFound",
        params: { pathMatch: path.substring(1).split("/") },
        query,
        hash,
      };
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
  routes,
  scrollBehavior,
  history: createWebHistory(),
});

export default router;
