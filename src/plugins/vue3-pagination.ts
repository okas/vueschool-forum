import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import type { App } from "vue";

export default (app: App) => app.component("VPagination", VPagination);
