import { RouteLocation, RouteLocationRaw, RouteRecordRaw } from "vue-router";
import { useCategoryStore } from "../stores/category-store";
import { useForumStore } from "../stores/forum-store";
import { usePostStore } from "../stores/post-store";
import { HasId } from "../types/HasId";
import { getValOrFirst } from "../utils/misc";
import { useThreadStore } from "./../stores/threads-store";
import { useUserStore } from "./../stores/user-store";

export const rawRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/PageHome.vue"),
    beforeEnter: async () => {
      const categories = await useCategoryStore().fetchAllCategories();
      const forumIds = categories.flatMap(({ forums }) => forums);
      await useForumStore().fetchForums(forumIds);
    },
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
    beforeEnter: async (routeObj) => {
      const categoryStore = useCategoryStore();

      const categoryId = getValOrFirst(routeObj.params.categoryId);

      if (!categoryId?.trim()) {
        throw getMissingParamError("categoryId");
      }

      const category = await categoryStore.fetchCategory(categoryId);
      if (!category) {
        throw new Error(`No category in database with id: ${categoryId}`);
      }

      await useForumStore().fetchForums(category.forums);

      return navigateToOrNotFound(
        routeObj,
        categoryStore.categories,
        "categoryId"
      );
    },
  },
  {
    path: "/forum/:forumId",
    name: "Forum",
    component: () => import("../pages/PageForum.vue"),
    props: true,
    beforeEnter: async (routeObj) => {
      const forumStore = useForumStore();

      const forumId = getValOrFirst(routeObj.params.forumId);
      if (!forumId?.trim()) {
        throw getMissingParamError("forumId");
      }

      await forumStore.fetchForum(forumId);

      return navigateToOrNotFound(routeObj, forumStore.forums, "forumId");
    },
  },
  {
    path: "/forum/:forumId/thread/create",
    name: "ThreadCreate",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadCreate.vue"),
    props: true,
    beforeEnter: async (routeObj) => {
      const forumStore = useForumStore();

      const forumId = getValOrFirst(routeObj.params.forumId);
      if (!forumId?.trim()) {
        throw getMissingParamError("forumId");
      }

      await forumStore.fetchForum(forumId);

      return navigateToOrNotFound(routeObj, forumStore.forums, "forumId");
    },
  },
  {
    path: "/thread/:threadId/edit",
    name: "ThreadEdit",
    meta: { requiresAuth: true },
    component: () => import("../pages/PageThreadEdit.vue"),
    props: true,
    beforeEnter: async (routeObj) => {
      const threadStore = useThreadStore();

      const threadId = getValOrFirst(routeObj.params.threadId);
      if (!threadId?.trim()) {
        throw new Error("Required param 'threadId' is empty or not found.");
      }

      const thread = await threadStore.fetchThread(threadId);
      if (!thread) {
        throw getMissingParamError("threadId");
      }

      await usePostStore().fetchPost(thread.firstPostId);

      return navigateToOrNotFound(routeObj, threadStore.threads, "threadId");
    },
  },
  {
    path: "/thread/:threadId",
    name: "ThreadShow",
    component: () => import("../pages/PageThread.vue"),
    props: true,
    beforeEnter: async (routeObj) => {
      const threadStore = useThreadStore();

      const threadId = getValOrFirst(routeObj.params.threadId);
      if (!threadId?.trim()) {
        throw new Error("Required param 'threadId' is empty or not found.");
      }

      const thread = await threadStore.fetchThread(threadId);
      if (!thread) {
        throw getMissingParamError("threadId");
      }

      const threadPosts = await usePostStore().fetchPosts(thread.posts);

      const postUserIds = threadPosts.map(({ userId }) => userId);

      await Promise.allSettled([
        useUserStore().fetchUsers([thread.userId, ...postUserIds]),
      ]);

      return navigateToOrNotFound(routeObj, threadStore.threads, "threadId");
    },
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/PageSoftNotFound.vue"),
  },
];

function navigateToOrNotFound<TViewModel extends HasId>(
  route: RouteLocation,
  array: Array<TViewModel>,
  paramKeyOrIdValue: string | null | undefined
): RouteLocationRaw | undefined {
  return paramKeyOrIdValue &&
    array.some(
      ({ id }) => id === (route.params[paramKeyOrIdValue] ?? paramKeyOrIdValue)
    )
    ? undefined
    : getRouteSoft404(route);
}

function getRouteSoft404({
  path,
  query,
  hash,
}: RouteLocation): RouteLocationRaw | undefined {
  return {
    name: "NotFound",
    params: {
      pathMatch: path.substring(1).split("/"),
    },
    query,
    hash,
  };
}

function getMissingParamError(paramName: string): Error {
  return new Error(`Required param '${paramName}' is empty or not found.`);
}
