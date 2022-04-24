import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/components/PageHome.vue"),
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: () => import("@/components/PageThreadShow.vue"),
    props: true,
  },
];

export default createRouter({ history: createWebHistory(), routes });
