import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./components/PageHome.vue"),
  },
];

export default createRouter({ history: createWebHistory(), routes });
