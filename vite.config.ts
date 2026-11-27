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
      "@algorithms": path.resolve(import.meta.dirname, "./src/algorithms"),
      "@data": path.resolve(import.meta.dirname, "./src/data"),
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
    },
  },
});
