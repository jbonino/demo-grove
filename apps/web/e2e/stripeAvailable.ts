import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const apiEnvPath = fileURLToPath(new URL("../../api/.env", import.meta.url));

export const stripeKeyAvailable =
  existsSync(apiEnvPath) && /^STRIPE_SECRET_KEY=\S/m.test(readFileSync(apiEnvPath, "utf-8"));
