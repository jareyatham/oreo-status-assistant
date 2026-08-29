import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isController = process.env.VITE_APP_MODE === "controller";
const CONTROLLER_PATH = "/control-s1sqlfctl212748"; // ใส่ path ลับจริงของคุณ

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "mascot/*"],
      manifest: {
        name: isController ? "Oreo Controller" : "Oreo Status Assistant",
        short_name: isController ? "Oreo Ctrl" : "Oreo",
        description: isController
          ? "Control panel for Oreo Status Assistant"
          : "เช็คว่าเจ้าของว่างไหม ",
        theme_color: "#F4FAF3",
        background_color: "#F4FAF3",
        display: "standalone",
        orientation: "portrait",
        start_url: isController ? CONTROLLER_PATH : "/",
        scope: isController ? CONTROLLER_PATH : "/",
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
        globPatterns: ["**/*.{js,css,html,gif,json,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /firebasedatabase\.app/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});