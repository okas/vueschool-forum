import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router";
import { threads as threadData } from "../data.json";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../components/PageHome.vue"),
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: () => import("../components/PageThreadShow.vue"),
    props: true,
    beforeEnter: (
      { params, path, query, hash }: RouteLocationNormalized,
      _: undefined,
      next
    ) =>
      next(
        threadData.some(({ id }) => id === params.id)
          ? undefined
          : {
              name: "NotFound",
              params: {
                pathMatch: path.substring(1).split("/"),
              },
              query,
              hash,
            }
      ),
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../components/PageNotFound.vue"),
  },
];

export default createRouter({ history: createWebHistory(), routes });
