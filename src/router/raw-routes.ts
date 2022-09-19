import { RouteRecordRaw } from "vue-router";
import { routeBeforeEnterGuards } from "./route-guards";

export const rawRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
    beforeEnter: routeBeforeEnterGuards.get("Home"),
  },
  {
    path: "/signin",
    name: "SignIn",
    meta: { requiresGuest: true },
    component: () => import("../pages/PageSignIn.vue"),
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
    component: () => import("../pages/PageRegister.vue"),
  },
  {
    path: "/me",
    name: "Profile",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageProfile.vue"),
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageProfile.vue"),
    props: { edit: true },
  },
  {
    path: "/category/:categoryId",
    name: "Category",
    component: () => import("../pages/PageCategory.vue"),
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
    component: () => import("../pages/PageForum.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("Forum"),
  },
  {
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadCreate.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("ThreadCreate"),
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadEdit.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("ThreadEdit"),
  },
  {
    path: "/thread/:threadId",
    name: "Thread",
    component: () => import("../pages/PageThread.vue"),
    props: true,
    beforeEnter: routeBeforeEnterGuards.get("Thread"),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/PageSoftNotFound.vue"),
  },
];
