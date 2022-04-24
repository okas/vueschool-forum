import { createRouter, createWebHistory } from "vue-router";

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
  },
  {
    // will match everything and put it under `$route.params.pathMatch`
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../components/PageNotFound.vue"),
  },
];

export default createRouter({ history: createWebHistory(), routes });
