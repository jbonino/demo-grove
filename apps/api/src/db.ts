import mongoose from "mongoose";

export function getMongoUri(): string {
  const uri = process.env.GROVE_MONGO_URI;
  if (!uri) {
    throw new Error("GROVE_MONGO_URI is not set");
  }
  return uri;
}

export async function connectDb(uri: string = getMongoUri()) {
  return mongoose.connect(uri);
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
