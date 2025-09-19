import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src/client",
      filename: "sw.ts",
      manifest: {
        name: "TrackMyBus",
        short_name: "TrackMyBus",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        icons: [
          {
            src: "/images/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      injectRegister: "auto",
    }),
  ],
  server: {
    allowedHosts: ["0efe64c82e53.ngrok-free.app"],
  },
});