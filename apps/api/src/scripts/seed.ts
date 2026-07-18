import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { seedMenuItems } from "../seed/menuItems.js";
import { seedRewards } from "../seed/rewards.js";
import { seedLoyaltyHistory } from "../seed/loyaltyHistory.js";

await connectDb();
await seedMenuItems();
console.log("Seeded menu items.");
await seedRewards();
console.log("Seeded rewards.");
await seedLoyaltyHistory();
console.log("Seeded customer loyalty history.");
await mongoose.disconnect();
