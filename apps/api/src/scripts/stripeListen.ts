import "dotenv/config";
import { spawn } from "node:child_process";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

spawn(
  "stripe",
  ["listen", "--api-key", key, "--forward-to", "localhost:3001/api/stripe/webhook"],
  { stdio: "inherit", shell: true },
);
