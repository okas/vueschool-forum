import useNotifications from "@/composables/useNotifications";
import type { HasId } from "@/models/HasId";
import { useCategoryStore } from "@/stores/category-store";
import { useForumStore } from "@/stores/forum-store";
import { usePostStore } from "@/stores/post-store";
import { useThreadStore } from "@/stores/thread-store";
import { useUserStore } from "@/stores/user-store";
import { getValOrFirst } from "@/utils/misc";
import type {
  NavigationGuardWithThis,
  RouteLocation,
  RouteLocationNamedRaw,
  RouteLocationRaw,
} from "vue-router";

const { addNotification } = useNotifications();

export const routeBeforeEnterGuards: ReadonlyMap<
  string,
  NavigationGuardWithThis<undefined> | NavigationGuardWithThis<undefined>[]
> = new Map([
  [
    "Home",
    async () => {
      const categories = await useCategoryStore().fetchAllCategories();

      const forums = await useForumStore().fetchForums(
        categories.flatMap(({ forums }) => forums)
      );

      const posts = await usePostStore().fetchPosts(
        forums.map(({ lastPostId }) => lastPostId)
      );

      await Promise.all([
        useUserStore().fetchUsers(posts.map(({ userId }) => userId)),
        useThreadStore().fetchThreads(posts.map(({ threadId }) => threadId)),
      ]);

      return undefined;
    },
  ],
  [
    "SignOut",
    async () => {
      await useUserStore().signOut();

      return { name: "Home" } as RouteLocationNamedRaw;
    },
  ],
  [
    "Category",
    async (routeObj: RouteLocation) => {
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

      return navigateToOrNotFound(routeObj, categoryStore.items, "categoryId");
    },
  ],
  [
    "Forum",
    async (routeObj: RouteLocation) => {
      const forumStore = useForumStore();

      const forumId = getValOrFirst(routeObj.params.forumId);
      if (!forumId?.trim()) {
        throw getMissingParamError("forumId");
      }

      await forumStore.fetchForum(forumId);

      return navigateToOrNotFound(routeObj, forumStore.items, "forumId");
    },
  ],
  [
    "ThreadCreate",
    async (routeObj: RouteLocation) => {
      const forumStore = useForumStore();

      const forumId = getValOrFirst(routeObj.params.forumId);
      if (!forumId?.trim()) {
        throw getMissingParamError("forumId");
      }

      await forumStore.fetchForum(forumId);

      return navigateToOrNotFound(routeObj, forumStore.items, "forumId");
    },
  ],
  [
    "ThreadEdit",
    async (routeObj: RouteLocation) => {
      const threadStore = useThreadStore();

      const threadId = getValOrFirst(routeObj.params.threadId);
      if (!threadId?.trim()) {
        throw new Error("Required param 'threadId' is empty or not found.");
      }

      const thread = await threadStore.fetchThread(threadId);
      if (!thread) {
        throw getMissingParamError("threadId");
      }

      if (!thread.firstPostId) {
        const err = getMissingFirstPostIdError();
        addNotification({ message: err.message, type: "error" }, 5000);
        throw err;
      }

      await usePostStore().fetchPost(thread.firstPostId);

      return navigateToOrNotFound(routeObj, threadStore.items, "threadId");
    },
  ],
  [
    "Thread",
    async (to: RouteLocation) => {
      const threadStore = useThreadStore();

      const threadId = getValOrFirst(to.params.threadId);
      if (!threadId?.trim()) {
        throw new Error("Required param 'threadId' is empty or not found.");
      }

      const thread = await threadStore.fetchThread(threadId);
      if (!thread) {
        throw getMissingParamError("threadId");
      }

      const threadPosts = await usePostStore().fetchPosts(thread.posts);

      const postUserIds = threadPosts.map(({ userId }) => userId);

      await useUserStore().fetchUsers([thread.userId, ...postUserIds]);

      return navigateToOrNotFound(to, threadStore.items, "threadId");
    },
  ],
]);

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

function getMissingFirstPostIdError(): Error {
  return new Error(
    `Required property "firstPostId" don't have a value. It is broken data problem, please report to support.`
  );
}
