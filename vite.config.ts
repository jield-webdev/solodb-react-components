import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins configuration
  plugins: [
    // React plugin (Babel) for fast refresh and JSX transformation
    react(),
    // Generate TypeScript declaration files
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/main.tsx", "src/routes/**/*"],
    }),
  ],

  // Resolve configuration
  resolve: {
    // Path aliases for cleaner imports
    alias: {
      "@": path.join(__dirname, "./src"),
      "@modules": path.join(__dirname, "./src/modules"),
      "@routes": path.join(__dirname, "./src/routes"),
      "@constants": path.join(__dirname, "./src/constants"),
    },
  },

  // Build configuration for library mode
  build: {
    // Output directory for the build
    outDir: "dist",
    // Library mode configuration
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "SoloDBReactComponents",
      formats: ["es", "umd"],
      fileName: (format) => `solodb-react-components.${format}.js`,
    },
    // Rollup options
    rollupOptions: {
      // Externalize peer dependencies so they're not bundled
      external: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
      output: {
        // Provide global variables for UMD build
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-router-dom": "ReactRouterDOM",
          "@tanstack/react-query": "ReactQuery",
        },
      },
    },
    // Generate source maps
    sourcemap: true,
    // Target modern browsers
    target: "es2020",
  },
});
