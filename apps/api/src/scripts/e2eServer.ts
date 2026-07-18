import "dotenv/config";
import { spawn } from "node:child_process";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedMenuItems } from "../seed/menuItems.js";
import { seedRewards } from "../seed/rewards.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";

export const E2E_REWARDS_PHONE = "+15559998888";
export const E2E_LOCKED_ONLY_PHONE = "+15559997777";

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();

await mongoose.connect(uri);
await seedMenuItems();
await seedRewards();
await LoyaltyEvent.create({ phone: E2E_REWARDS_PHONE, orderId: null, type: "earn", points: 400 });
await LoyaltyEvent.create({ phone: E2E_LOCKED_ONLY_PHONE, orderId: null, type: "earn", points: 100 });
await mongoose.disconnect();

const child = spawn("npx", ["tsx", "src/index.ts"], {
  env: { ...process.env, GROVE_MONGO_URI: uri },
  stdio: "inherit",
  shell: true,
});

async function shutdown(code: number) {
  child.kill();
  await mongod.stop();
  process.exit(code);
}

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
child.on("exit", (code) => void shutdown(code ?? 0));
