import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages base path (your repository name)
  base: "/ElectromartShop/",

  // Build output directory must be 'dist' for gh-pages
  build: {
    outDir: "dist",
  },

  // Module path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },

  // Plugins
  plugins: [react()],
});
