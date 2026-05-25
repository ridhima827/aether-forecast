import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { componentTagger } from "lovable-tagger";

// Plain Vite SPA — TanStack Router (file-based) + Tailwind v4.
// Output: dist/. Deploys cleanly to Vercel (see vercel.json).
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
    }),
    react(),
    command === "serve" && mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
}));
