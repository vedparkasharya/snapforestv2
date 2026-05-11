import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set in environment variables");
}

let cached = global as any;
if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.mongoose.conn) return cached.mongoose.conn;
  if (cached.mongoose.promise) {
    cached.mongoose.conn = await cached.mongoose.promise;
    return cached.mongoose.conn;
  }

  cached.mongoose.promise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  }).then((m) => m);

  cached.mongoose.conn = await cached.mongoose.promise;
  console.log("MongoDB connected successfully");
  return cached.mongoose.conn;
}

export function getMongoDb() {
  return mongoose.connection;
}
