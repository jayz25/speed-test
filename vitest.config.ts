import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true,
    exclude: [...configDefaults.exclude, ".worktrees/**"],
    coverage: {
      provider: "v8",
      include: ["utils/**", "redux/**"],
      exclude: [".worktrees/**", "**/__tests__/**", "utils/hooks/useCaretTracking.ts"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
