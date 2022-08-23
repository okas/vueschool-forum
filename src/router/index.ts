import {
  createRouter,
  createWebHistory,
  RouteLocation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
} from "vue-router";
import { useMainStore } from "../stores/main-store";

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
  },
  {
    path: "/me",
    name: "Profile",
    component: () => import("../pages/PageProfile.vue"),
    meta: { toTop: true, smoothScroll: true },
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    component: () => import("../pages/PageProfile.vue"),
    props: { edit: true },
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
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    component: () => import("../pages/PageThreadCreate.vue"),
    props: true,
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    component: () => import("../pages/PageThreadEdit.vue"),
    props: true,
  },
  {
    path: "/thread/:threadId",
    name: "ThreadShow",
    component: () => import("../pages/PageThread.vue"),
    props: true,
    // beforeEnter: (
    //   routeObj,
    //   _: unknown,
    //   next: (p: RouteLocationRaw | undefined) => void
    // ) => next(testForNotFound(routeObj)),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/PageNotFound.vue"),
  },
];

function testForNotFound({
  params,
  path,
  query,
  hash,
}: RouteLocation): RouteLocationRaw | undefined {
  return useMainStore().threads.some(({ id }) => id === params.threadId)
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

router.beforeEach(async (_, from) => {
  const store = useMainStore();
  // < FETCH
  await store.fetchAuthUser();
  // > FETCH
});

export default router;
