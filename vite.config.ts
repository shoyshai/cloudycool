import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: "/cloudycool/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CloudyCool",
        short_name: "CloudyCool",
        description: "Premium weather app with hourly forecast and air quality insights",
        start_url: "/cloudycool/",
        scope: "/cloudycool/",
        display: "standalone",
        background_color: "#0f2742",
        theme_color: "#2a82ff",
        icons: [
          {
            src: "/cloudycool/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/cloudycool/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/cloudycool/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
