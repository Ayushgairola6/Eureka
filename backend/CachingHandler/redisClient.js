import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_STRING,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();
