import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { router } from "sv-router/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), router()],
});
