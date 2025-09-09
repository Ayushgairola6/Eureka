import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();


export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 11980
    }
});

redisClient.on("error", err => console.error(`Redis client connection error :${err}`));


await redisClient.connect();