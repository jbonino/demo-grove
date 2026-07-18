import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { seedMenuItems } from "../seed/menuItems.js";

await connectDb();
await seedMenuItems();
console.log("Seeded menu items.");
await mongoose.disconnect();
