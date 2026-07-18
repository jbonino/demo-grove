import { defineConfig } from "@playwright/test";
import { stripeKeyAvailable } from "./e2e/stripeAvailable";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: [
    {
      command: "npm run e2e-server --workspace apps/api",
      cwd: "../..",
      url: "http://localhost:3001/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: "npm run dev",
      cwd: ".",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
    ...(stripeKeyAvailable
      ? [
          {
            command: "npm run stripe:listen --workspace apps/api",
            cwd: "../..",
            reuseExistingServer: true,
            timeout: 15000,
          },
        ]
      : []),
  ],
});
