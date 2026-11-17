import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { router } from "sv-router/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), router()],
  resolve: {
    alias: {
      "@algorithms": path.resolve(__dirname, "./src/algorithms"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});
