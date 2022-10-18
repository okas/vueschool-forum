import { createRouter, createWebHistory } from "vue-router";
import { afterEachGuard, beforeEachGuard } from "./global-route-guards";
import routes from "./raw-routes";
import scrollBehavior from "./scroll-behavior";

const router = createRouter({
  routes,
  scrollBehavior,
  history: createWebHistory(),
});

router.beforeEach(beforeEachGuard);

router.afterEach(afterEachGuard);

export default router;
