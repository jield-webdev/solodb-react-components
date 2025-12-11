import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Plugins configuration
    plugins: [
      // React plugin (Babel) for fast refresh and JSX transformation
      react(),
    ],

    // Disable copying files from public directory
    publicDir: false,

    // Resolve configuration
    resolve: {
      // Path aliases for cleaner imports
      alias: {
        "@": path.join(__dirname, "./src"),
        "@modules": path.join(__dirname, "./src/modules"),
        "@routes": path.join(__dirname, "./src/routes"),
        "@constants": path.join(__dirname, "./src/constants"),
      },
      // Package entry fields to use
      mainFields: ["browser", "module", "main"],
    },

    // Development server configuration
    server: {
      // Enable hot module replacement
      hmr: true,
      // Port to run the dev server on
      port: 3000,
      // Enable CORS for API requests during development
      cors: true,
      // Automatically open browser on server start
      open: true,
    },

    // Build configuration
    build: {
      // Output directory for the build
      outDir: "../public",
      // Don't generate HTML files in the output
      emptyOutDir: false,
      // Generate source maps for production build
      sourcemap: mode !== "production",
      // Minify output
      minify: mode === "production" ? "esbuild" : false,
      // Improve chunk splitting for better caching
      rollupOptions: {
        // Specify JS entry point directly instead of using HTML
        input: "./src/main.tsx",
        output: {
          // Customize chunk and asset file names
          entryFileNames: `react/assets/react-[hash].js`,
          chunkFileNames: (chunkInfo) => {
            return "react/assets/[name].[hash].js";
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "react/assets/styles.css";
            }
            return "react/assets/[name].[ext]";
          },
          // Improve chunking strategy
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
          },
        },
      },
      // Increase the warning limit for chunk size
      chunkSizeWarningLimit: 1000,
      // Target modern browsers
      target: "es2020",
    },

    // CSS configuration
    css: {
      // Generate source maps for CSS
      devSourcemap: true,
      // Configure preprocessors if needed
      preprocessorOptions: {
        // SCSS configuration - adjust paths if needed
        scss: {
          // No additionalData since styles are loaded from external files
        },
      },
    },

    // Define global constants for the app
    define: {
      // Make specific env variables available in the app
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV || mode),
      "process.env.BASE_URL": JSON.stringify(env.BASE_URL || "/"),
      // Add build timestamp
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Optimize dependencies
    optimizeDeps: {
      // Include dependencies that might not be detected
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
