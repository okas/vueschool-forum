import {
  createRouter,
  createWebHistory,
  RouteLocation,
  RouteLocationRaw,
  RouteRecordRaw,
} from "vue-router";
import { useMainStore } from "./../store/index";

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
  },
  {
    path: "/category/:categoryId",
    name: "Category",
    component: () => import("../pages/PageCategory.vue"),
    props: true,
  },
  {
    path: "/forum/:forumId",
    name: "Forum",
    component: () => import("../pages/PageForum.vue"),
    props: true,
  },
  {
    path: "/thread/:threadId",
    name: "ThreadShow",
    component: () => import("../pages/PageThreadShow.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (p: RouteLocationRaw | undefined) => void
    ) => next(test(routeObj)),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/PageNotFound.vue"),
  },
];

function test({
  params,
  path,
  query,
  hash,
}: RouteLocation): RouteLocationRaw | undefined {
  return useMainStore().threads.some(({ id }) => id === params.id)
    ? undefined
    : {
        name: "NotFound",
        params: { pathMatch: path.substring(1).split("/") },
        query,
        hash,
      };
}

export default createRouter({ history: createWebHistory(), routes });
