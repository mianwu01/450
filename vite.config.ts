import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Standalone prototype for the Academic Workflow Assistant Agent.
// Mirrors Nanobot's webui stack (React + Vite + TS + Tailwind) so this
// page can later be lifted into nanobot/webui as a route with minimal churn.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5273,
  },
});
