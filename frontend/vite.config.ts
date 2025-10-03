import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8082, // Fixed port to match Google OAuth configuration
    strictPort: true, // Fail if port 8082 is in use instead of trying another port
    hmr: {
      port: 8082,
      host: "localhost"
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Explicitly configure environment variable handling
  envPrefix: 'VITE_',
  envDir: './',
}));
