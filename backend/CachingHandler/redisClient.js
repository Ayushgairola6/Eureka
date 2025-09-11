import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_STRING,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();
