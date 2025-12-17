import dayjs from "dayjs"; // Recommended for easy TTL calc, or use your Date math
import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

//handles limit check and update all at once
export const ProcessUserQuery = async (user, queryType) => {
  const user_id = user.user_id;
  const DAILY_LIMIT = 10;

  // 1. Premium Check (Fastest exit)
  if (user.PaymentStatus === true) {
    return { status: "ok", message: "Premium user - no limits" };
  }

  // measure for day_date field
  const today = new Date().toISOString().split("T")[0];

  try {
    //atomic update for the user to avoid race conditions
    const UserAccountDataKey = `user_id=${user_id}'s_dashboardData`;

    let newCount;

    //one synthesisQuery==5 queries
    if (queryType === "Synthesis") {
      newCount = await IncrementCache(UserAccountDataKey, 5);
    } else {
      newCount = await IncrementCache(UserAccountDataKey, 1);
    } //This is an upsert operation
    // If Redis says count is '1', it implies this is the first request of the day.
    // BUT, Redis might have just crashed or evicted the key.
    // We must check the DB *once* to be sure we aren't resetting a user who actually has 15 queries.

    if (newCount === 1) {
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
        const refreshTime = await redisClient.ttl(UserAccountDataKey);
        console.log(refreshTime);
        // If the corrected count exceeds limit, stop here
        if (correctCount > DAILY_LIMIT) {
          console.log("The correct count from db is moew than daily quota");
          return {
            status: "not ok",
            message: `You have reached your daily limit it will reset at ${refreshTime}`,
          };
        }
        console.log(newCount, "Newcount");

        // Sync the increment to DB via RPC

        console.log("Updating the db");
        // await supabase.rpc("rpc_increment_rate_limit", {
        //   p_user_id: user_id,
        //   p_day_date: today,
        // }); ///use the rpc fnction to upsert the informaiton

        const { data: newCount, error } = await supabase
          .from("Question_Rate_Limits")
          .update({ question_asked_count: newCount, day_date: today })
          .eq("user_id", user.user_id)
          .eq("day_date", today)
          .select()
          .single();

        if (error) {
          console.error(
            "An error occured whileupdating users quota details",
            error
          );
        }

        return {
          status: "ok",
          message: `Query ${correctCount} of ${DAILY_LIMIT}`,
        };
      }
    }

    if (newCount > DAILY_LIMIT) {
      console.log(newCount, "limit reached");

      return {
        status: "not ok",
        message: `You have reached your free tier limit of ${DAILY_LIMIT} queries.`,
      };
    }

    //if the query fails once try it again once more
    // const { error } = await supabase.rpc("rpc_increment_rate_limit", {
    //   p_user_id: user_id,
    //   p_day_date: today,
    // });
    // if (error) {
    //   await notifyMe(
    //     "An error occured in the rate_limit rpc function check asap",
    //     error
    //   );
    // }
    console.log(newCount, "Newcount");

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

async function IncrementCache(key, value) {
  const exists = await redisClient.exists(key);
  if (exists) {
    await redisClient.hIncrBy(key, "querycount", JSON.stringify(value));
  }
}
///check the user conribution information
export const CheckUserContributionCount = async (user) => {
  const UserAccountDataKey = `user_id=${user.user_id}'s_dashboardData`;

  const exists = await redisClient.exists(UserAccountDataKey);

  //if users cache exists
  if (exists) {
    //as we only fetch the privatedocuments of the user
    const data = await redisClient.hGet(UserAccountDataKey, "Contributions");
    //find the documents that are private

    if (JSON.parse(data) >= 2) {
      return { message: "limit reached" };
    }
  }

  //check database if no cache exiss
  const { data, error } = await supabase
    .from("Contributions")
    .select("document_id", { count: "exact" })
    .eq("user_id", user.user_id)
    .eq("Document_visibility", "Private");

  if (error) {
    console.error("error while checking the user doccount", error);
    await notifyMe(
      "An error occured in user contribution count checker fuction",
      error
    );
  }
  if (data && data?.length >= 2) {
    return { message: "Limit reached" };
  }
  return { message: "within bounds" };
};
