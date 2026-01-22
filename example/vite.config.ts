import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.join(__dirname, "./src"),

      // In development, override the @ alias to point to the main src
      // Use local source code for these libraries
      "@jield/solodb-react-components": path.join(__dirname, "../src"),
    },
    dedupe: ["react", "react-dom"],
  },

  server: {
    port: 3000,
    open: true,
  },
});
