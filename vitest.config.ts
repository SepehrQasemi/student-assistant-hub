import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      exclude: [
        "tests/**",
        "app/**/page.tsx",
        "app/layout.tsx",
        "components/ui/**",
        "lib/i18n/messages/**",
        "docs/**",
        "scripts/**",
        "**/*.d.ts",
        "next-env.d.ts",
        "next.config.ts",
        "playwright.config.ts",
        "eslint.config.mjs",
        "postcss.config.mjs",
        "RUN_ME_WINDOWS.bat",
        "RUN_ME_WINDOWS.ps1",
        "RUN_ME_UNIX.sh",
        "STOP_WINDOWS.ps1",
        "STOP_UNIX.sh",
      ],
      thresholds: {
        lines: 72,
        statements: 72,
        functions: 72,
        branches: 62,
      },
    },
  },
});
