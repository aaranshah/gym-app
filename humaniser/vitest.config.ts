import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // `server-only` throws outside Next's server bundle; it's a no-op for tests.
      "server-only": path.resolve(import.meta.dirname, "tests/unit/server-only-stub.ts"),
    },
  },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
