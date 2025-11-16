import { createClient } from "redis";
import dotenv from "dotenv";
import { error } from "console";
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

export const UpdateUserFileListCacheInfo = async (key, FileInfo) => {
  if (!key || typeof key !== "string") {
    return { error: "Invalid key type" };
  }

  // check if the info event exists in the cache even before updating
  const exists = await redisClient.exists(key);
  if (!exists) {
    return { message: "Cache does not exist" };
  }

  // if an old array of file exists push in it and then update the cache
  const OldCache = await redisClient.hGet(key, "Contributions");

  if (OldCache) {
    const ParsedInfo = JSON.parse(OldCache);
    ParsedInfo.push(FileInfo);
    await redisClient.hSet(key, "Contributions", JSON.stringify(ParsedInfo));
    return;
  }
  await redisClient
    .hSet(key, "Contributions", JSON.stringify(FileInfo))
    .catch((error) => {
      return { error: error };
    });

  return { message: "Cache Updated" };
};

export const UpdateTheNotificationCache = async (key, notification) => {
  const exists = await redisClient.exists(key);
  if (!exists) {
    return { message: "cache does not exist" };
  }

  //  getting any old notifications if exists
  const Oldnotifications = await redisClient.hGet(key, "notification");

  if (Oldnotifications) {
    const ParsedNotifications = JSON.parse(Oldnotifications);
    ParsedNotifications.push(notification);
    await redisClient.hSet(
      key,
      "notification",
      JSON.stringify(ParsedNotifications)
    );
    return { message: "New notification has been added with others" };
  }
  //  update the notification cache
  await redisClient.hSet(
    key,
    "notification",
    JSON.stringify(ParsedNotifications)
  );
  return { message: "New first notification has been cached" };
};
