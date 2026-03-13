import { defineConfig } from "vite";

export default defineConfig({
  // Use the repository base path when building on GitHub Actions (GitHub Pages).
  base: process.env.GITHUB_ACTIONS ? "/gradient/" : "/",
});
