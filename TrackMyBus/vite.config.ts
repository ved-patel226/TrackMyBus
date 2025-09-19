import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

  ],
  server: {
    allowedHosts: ["swsov-24-228-177-84.a.free.pinggy.link"],
  },
});