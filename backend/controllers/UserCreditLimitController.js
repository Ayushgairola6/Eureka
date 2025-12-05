import dayjs from "dayjs"; // Recommended for easy TTL calc, or use your Date math
import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

//handles limit check and update all at once
export const ProcessUserQuery = async (user) => {
  const user_id = user.user_id;
  const DAILY_LIMIT = 20;

  // 1. Premium Check (Fastest exit)
  if (user.PaymentStatus === true) {
    return { status: "ok", message: "Premium user - no limits" };
  }

  const today = new Date().toISOString().split("T")[0];

  const redisKey = `rate_limit:${user_id}:${today}`; //unique user cache rate limit tracing key

  // await redisClient.del(redisKey);

  try {
    //atomic updte for the user to avoid race conditions
    const UserAccountDataKey = `user_id=${user_id}&username=${user.username}'s_dashboardData`;

    const newCount = await redisClient.hIncrBy(
      UserAccountDataKey,
      "querycount",
      1
    ); //This is an upsert operation

    // If Redis says count is '1', it implies this is the first request of the day.
    // BUT, Redis might have just crashed or evicted the key.
    // We must check the DB *once* to be sure we aren't resetting a user who actually has 15 queries.

    if (newCount === 1) {
      // Set the expiry for the end of the day since we just created the key
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const ttl = Math.floor((endOfDay - now) / 1000);
      await redisClient.expire(UserAccountDataKey, ttl); // set a new key expiry date

      // Verify against DB to ensure this isn't a false reset
      // We read the DB only on the "first" request of the cached session
      const { data: dbData } = await supabase
        .from("Question_Rate_Limits")
        .select("question_asked_count")
        .eq("user_id", user_id)
        .eq("day_date", today) //value that only matches today
        .single();

      // If DB has data (e.g., 15) but Redis said 1, we sync Redis to DB + 1
      if (dbData && dbData.question_asked_count > 0) {
        const correctCount = dbData.question_asked_count + 1;

        // Fix Redis to match reality
        console.log(
          "The value was okay so updating the cache with confirmed value"
        );
        await redisClient.hSet(UserAccountDataKey, "querycount", correctCount); //update the new value for the user if the older data was wrong

        // If the corrected count exceeds limit, stop here
        if (correctCount > DAILY_LIMIT) {
          console.log("The correct count from db is moew than daily quota");
          return {
            status: "not ok",
            message: `You have reached your daily limit it will reset at ${endOfDay}`,
          };
        }

        // Sync the increment to DB via RPC
        console.log("Updating the db");
        await supabase.rpc("rpc_increment_rate_limit", {
          p_user_id: user_id,
          p_day_date: today,
        }); ///use the rpc fnction to upsert the informaiton

        return {
          status: "ok",
          message: `Query ${correctCount} of ${DAILY_LIMIT}`,
        };
      }
    }

    if (newCount > DAILY_LIMIT) {
      return {
        status: "not ok",
        message: `You have reached your free tier limit of ${DAILY_LIMIT} queries.`,
      };
    }

    //if the query fails once try it again once more
    const { error } = await supabase.rpc("rpc_increment_rate_limit", {
      p_user_id: user_id,
      p_day_date: today,
    });
    if (error) {
      await notifyMe(
        "An error occured in the rate_limit rpc function check asap",
        error
      );
    }

    return {
      status: "ok",
      message: `Query ${newCount} of ${DAILY_LIMIT}`,
    };
  } catch (error) {
    console.error(error);
    await notifyMe("Something went wrong in the rateLimiterController", error);
    return { status: "not ok", message: "Service temporarily unavailable" };
  }
};
