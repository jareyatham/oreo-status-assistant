import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // ❌ เอา mascot ออกจาก precache
      includeAssets: ["favicon.ico"],

      manifest: {
        name: "Oreo Status Assistant",
        short_name: "Oreo",
        description: "เช็คว่าเจ้าของว่างไหม 🐶",
        theme_color: "#0B0F14",          // 👉 เปลี่ยนเป็น dark theme
        background_color: "#0B0F14",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",

        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // ❌ เอา gif ออกจาก precache
        globPatterns: ["**/*.{js,css,html,json,png,svg}"],

        runtimeCaching: [
          {
            urlPattern: /\/mascot\/.*\.gif$/,
            handler: "CacheFirst",
            options: {
              cacheName: "mascot-gifs",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 วัน
              },
            },
          },
          {
            urlPattern: /firebasedatabase\.app/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});