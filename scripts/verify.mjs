import { spawnSync } from "node:child_process";

const includeE2E = process.argv.includes("--e2e");
const steps = includeE2E ? ["lint", "test", "build", "test:e2e"] : ["lint", "test", "build"];

for (const step of steps) {
  const result = spawnSync("npm", ["run", step], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.exit(0);
