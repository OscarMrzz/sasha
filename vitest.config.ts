import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setupEnv.ts"],
    include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/**"],
    coverage: {
      provider: "v8",
      include: ["src/helpers/**", "src/services/**"],
      exclude: [
        "src/services/globalServices.ts",
        "src/services/penalizacionesServices.ts",
        "src/services/registroPenalizacionesServices.ts",
        "src/services/registroResultadosServices.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
