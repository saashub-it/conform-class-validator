import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      include: ["src/**"],
      reporter: ["text", "json-summary"],
    },
  },
});
