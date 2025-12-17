import { createClient } from "redis";
import dotenv from "dotenv";
// import { error } from "console";
// import e from "cors";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { supabase } from "../controllers/supabaseHandler.js";
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
    // console.log("ParsedCacheInfoOfContributions", ParsedInfo);
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

export const UpdateTheNotificationCache = async (
  UserAccountDataKey,
  userid,
  feedback
) => {
  // create a new notification and inster it in the db
  const metadata = {
    sent_by_username: "System",
  };
  // add a new notification in the database
  const { data: newNotification, error: insertError } = await supabase
    .from("notifications")
    .insert({
      user_id: userid, //person who is responsible for this notification
      notification_type: "Informatory",
      notification_message: `A new file ${feedback} uploaded .`,
      title: "New file uploaded",
      metadata: metadata,
    })
    .select("*")
    .single();

  if (insertError) {
    await notifyMe(
      `${insertError}= This error occured while Inserting notification data in file upload controller `
    );
  }

  //if the user data exists in the cache
  const multi = redisClient.multi();
  multi.exists(UserAccountDataKey);
  const Oldnotifications = multi.redisClient.hGet(key, "notification");

  if (Oldnotifications) {
    const ParsedNotifications = JSON.parse(Oldnotifications);
    ParsedNotifications.push(newNotification);
    multi.redisClient.hSet(
      key,
      "notification",
      JSON.stringify(ParsedNotifications)
    );

    multi.hSet(
      key,
      "notificationcount",
      JSON.stringify(ParsedNotifications?.length)
    );
  }

  await multi.exec();
  return { message: "New first notification has been cached", newNotification };
};

// caching the current chats of the user for few hours
export const CacheCurrentChat = async (message, user) => {
  const ChatArray = []; //array to store the chat history
  const ConversationCacheKey = `user_id=${
    user.user_id
  }_time=${new Date().toDateString()}`;

  const exists = await redisClient.exists(ConversationCacheKey);
  if (exists) {
    const Chats = await redisClient.rPush(
      ConversationCacheKey,
      JSON.stringify(message)
    ); //update the list
  } else {
    //using redis multi to execute two operations together to avoid race conditions
    const multi = redisClient.multi();

    multi.rPush(ConversationCacheKey, JSON.stringify(message));
    multi.expire(ConversationCacheKey, 4000); // 4000 seconds

    //execute the logic atomically
    const result = await multi.exec();
    if (result === null) {
      console.error("error while executing the redis multi command");
    }
  }
  // console.log("this message was just cached right now", message);
  return { message: "Record updated or created new record" };
};
// fetch chat history from cache
export const FetchChatHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Please login to continue" });
    }
    const user = req.user;
    const ConversationCacheKey = `user_id=${
      user.user_id
    }_time=${new Date().toDateString()}`;
    // await redisClient.del(ConversationCacheKey);
    // console.log("This function has been called");
    const exists = await redisClient.exists(ConversationCacheKey);
    // console.log(exists);
    if (exists) {
      const limit = user.PaymentStatus === true ? 30 : 10; //the limit of cached messages the users can fetch based on payment status

      const Chats = await redisClient.lRange(ConversationCacheKey, 0, limit); //last 10 chat messages retrive them
      const parsedChats = Chats.map((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (error) {
          console.error("Error parsing JSON message:", jsonString, error);
          // Return a placeholder or handle the error as needed
          return re.status(400).send({ error: "Parse Error", data: [] });
        }
      });
      // console.log(parsedChats);
      return res
        .status(200)
        .send({ message: "History found", data: parsedChats });
    }

    return res.status(200).send({ message: "History not found", data: [] });
  } catch (error) {
    console.error(error);
    await notifyMe(
      "An error occured while retriveing chat history from cache",
      error
    );
  }
};
