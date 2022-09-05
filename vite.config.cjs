import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": import.meta.resolve(__dirname, "./src"),
    },
  },
});
