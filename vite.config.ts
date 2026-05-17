import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/profgui/" : "/",
  envDir: path.resolve(import.meta.dirname),
  plugins: [
    react(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "ProfGui - Soutien Scolaire",
        short_name: "ProfGui",
        description: "Plateforme de soutien scolaire en Guinée",
        theme_color: "#ffffff",
        icons: [
          {
            src: "favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(
      import.meta.dirname,
      process.env.GITHUB_PAGES === "true" ? "dist" : "dist/public",
    ),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
