import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/detailing-site/",
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  resolve: {
    alias: {
      // 2. Говорим Vite, что символ @ — это ссылка на папку ./src
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "automania.local",
    port: 5173,
  },
});
