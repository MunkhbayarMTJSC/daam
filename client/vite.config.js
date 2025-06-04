import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
  build: {
    // input заах шаардлагагүй, default main.html-ийг ашиглана
    outDir: "dist",
  },
});
