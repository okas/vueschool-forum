import { RouteLocation, RouteLocationRaw, RouteRecordRaw } from "vue-router";
import { useCategoryStore } from "../stores/category-store";
import { useForumStore } from "../stores/forum-store";
import { HasId } from "../types/HasId";
import { useThreadStore } from "./../stores/threads-store";
import { useUserStore } from "./../stores/user-store";

export const rawRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
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
    async beforeEnter() {
      await useUserStore().signOut();
      return { name: "Home" };
    },
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
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) =>
      next(
        testForNotFound(routeObj, useCategoryStore().categories, "categoryId")
      ),
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
    ) => next(testForNotFound(routeObj, useForumStore().forums, "forumId")),
  },
  {
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadCreate.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useForumStore().forums, "forumId")),
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadEdit.vue"),
    props: true,
    beforeEnter: (
      routeObj,
      _: unknown,
      next: (route: RouteLocationRaw | undefined) => void
    ) => next(testForNotFound(routeObj, useThreadStore().threads, "threadId")),
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
    ) => next(testForNotFound(routeObj, useThreadStore().threads, "threadId")),
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
  paramKeyOrIdValue: string | null
): RouteLocationRaw | undefined {
  return paramKeyOrIdValue &&
    array.some(
      ({ id }) => id === (params[paramKeyOrIdValue] ?? paramKeyOrIdValue)
    )
    ? undefined
    : {
        name: "NotFound",
        params: {
          pathMatch: path.substring(1).split("/"),
        },
        query,
        hash,
      };
}
