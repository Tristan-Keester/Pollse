import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  root: "./client/",
  server: {
    port: 8080,
    proxy: {
      "/api/": {
        target: "http://localhost:3000",
      },
    },
  },
});
