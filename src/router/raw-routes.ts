import type { RouteMeta, RouteRecordRaw } from "vue-router";
import { routeBeforeEnterGuards } from "./per-route-guards";

const rawRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/HomePage.vue"),
    beforeEnter: routeBeforeEnterGuards.get("Home"),
  },
  {
    path: "/signin",
    name: "SignIn",
    meta: { requiresGuest: true },
    component: () => import("@/pages/SignInPage.vue"),
  },
  {
    path: "/signout",
    name: "SignOut",
    component: () => undefined, // To fullfil `RouteRecordRaw` API.
    beforeEnter: routeBeforeEnterGuards.get("SignOut"),
  },
  {
    path: "/register",
    name: "Register",
    meta: { requiresGuest: true },
    component: () => import("@/pages/RegisterPage.vue"),
  },
  {
    path: "/me",
    name: "Profile",
    meta: { requiresAuth: true },
    component: () => import("@/pages/ProfilePage.vue"),
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    meta: { requiresAuth: true },
    component: () => import("@/pages/ProfilePage.vue"),
    props: { edit: true },
  },
  {
    path: "/category/:categoryId",
    name: "Category",
    component: () => import("@/pages/CategoryPage.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("Category"),
  },
  {
    path: "/forum/:forumId",
    name: "Forum",
    redirect: ({ hash, params, query: { page, ...qryRest } }) => ({
      name: "ForumPaged",
      query: { ...qryRest, page: page ?? "1" },
      params,
      hash,
    }),
  },
  {
    path: "/forum/:forumId",
    name: "ForumPaged",
    component: () => import("@/pages/ForumPage.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("Forum"),
  },
  {
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    meta: { requiresAuth: true },
    component: () => import("@/pages/ThreadCreatePage.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("ThreadCreate"),
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    meta: { requiresAuth: true },
    component: () => import("@/pages/ThreadEditPage.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("ThreadEdit"),
  },
  {
    path: "/thread/:threadId",
    name: "Thread",
    component: () => import("@/pages/ThreadPage.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("Thread"),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/SoftNotFoundPage.vue"),
  },
];

const defaultMeta: RouteMeta = {
  toTop: true,
  smoothScroll: true,
  transitionName: "fade",
};

const routes = rawRoutes.map(({ meta, ...restRoute }: RouteRecordRaw) => ({
  ...restRoute,
  meta: Object.assign({}, defaultMeta, meta),
}));

export default routes;
