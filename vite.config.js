import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
import eslintPlugin from "vite-plugin-eslint";
import {
  VeeValidateResolver,
  Vu3PaginationResolver,
} from "./src/plugins/unplugin-vue-components";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin(),
    Components({
      dts: "src/types/components.d.ts",
      resolvers: [VeeValidateResolver(), Vu3PaginationResolver()],
    }),
    chunkSplitPlugin({
      strategy: "single-vendor",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  cors: {
    origin: "*",
    hmr: true,
  },
  server: {
    port: 8080,
  },
});
