import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
dotenv.config();
//handles limit check and update all at once
export async function GlobalRequestRateLimit(req, res, next) {
  const LIMIT = process.env.AGENT_REQUESTS_PER_MINUTE; //requests allowed for agent per minute
  const WINDOW_SECONDS = 60; // 1 minute

  //unique integer for every minute
  const currentMinuteEpoch = Math.floor(Date.now() / 60000);
  const key = `Anti-Node_global_rate_limit:${currentMinuteEpoch}`;

  try {
    //if value does not exist add a new one else increment existing one
    const currentCount = await redisClient.incr(key);

    // if this is the first value of minute set an expiry
    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW_SECONDS + 5);
    }

    //  Check Limit
    if (currentCount > LIMIT) {
      return res.status(429).send({ message: "Too many requests" });
    }

    next();
  } catch (err) {
    await notifyMe("Error in redis based global rate limit handler", err);
    // Fail OPEN: If Redis goes down, allow traffic so you don't kill your app.
    next();
  }
}

//main handler for user question request as middleware
export const ProcessUserQuery = async (user, queryType) => {
  const user_id = user.user_id;
  const Monthly_Quota = parseInt(process.env.USER_QUOTA_LIMIT || 20); // Always parse env vars

  // check if the user is a paid member
  const PaymentStatus = await CheckUserPlanStatus(user_id);
  if (PaymentStatus?.isPaid === true) {
    return { status: "ok", message: "Premium user - no limits" };
  }

  try {
    // FIX 1: Passed the required arguments (user_id, queryType)
    const CurrentCount = await CheckQuotaInCacheAndDB(user_id, queryType);

    // Check if the NEW count exceeds limit
    if (CurrentCount > Monthly_Quota) {
      return {
        status: "not ok",
        message: "You have exhausted your monthly quota",
      };
    }

    return { status: "ok" }; // Explicit success return
  } catch (error) {
    await notifyMe("Rate Limit Error", error);
    // Fail Open: If system breaks, let user through (better UX)
    return { status: "ok", message: "System bypass" };
  }
};

// update the database
async function updateDbQuota(user_id, monthKey, count) {
  const { error } = await supabase.from("Question_Rate_Limits").upsert(
    {
      user_id: user_id,
      "Month-Year": monthKey,
      question_asked_count: count,
    },
    { onConflict: 'user_id, "Month-Year"' }
  );

  if (error) console.error("Failed to sync quota to DB:", error);
}

//checks the user quota in cache as well as db and then caches it
export async function CheckQuotaInCacheAndDB(user_id, query_type) {
  const date = new Date();

  const currentMonthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; //year-month foramat
  const redisKey = `quota:${user_id}:${currentMonthKey}`; //the current year and month is also the key

  const CACHE_TTL = 86400; // 86400/60*60 minutes

  try {
    const exists = await redisClient.exists(redisKey);

    // counter variable to track down the type of query being processed
    let newCount;

    if (exists) {
      if (query_type === "Synthesis") {
        newCount = await redisClient.incrBy(redisKey, 2);
      } else {
        newCount = await redisClient.incr(redisKey);
      }

      // update the database and do not wait for the promist to be resolved
      updateDbQuota(user_id, currentMonthKey, newCount);
    } else {
      const { data, error } = await supabase
        .from("Question_Rate_Limits")
        .select("question_asked_count")
        .eq("user_id", user_id)
        .eq("Month-Year", currentMonthKey)
        .maybeSingle();

      let dbCount = 0;
      if (data) {
        dbCount = data.question_asked_count;
      }

      // C. Calculate new count
      if (query_type === "Synthesis") {
        newCount = dbCount + 2;
      } else {
        newCount = dbCount + 1;
      }

      // D. "Warm up" the cache
      // We set the value to the new count.
      await redisClient.set(redisKey, newCount, "EX", CACHE_TTL);

      // E. Ensure DB row exists/updates
      // We await this one to ensure the row is created if it's a brand new month
      await updateDbQuota(user_id, currentMonthKey, newCount);
    }

    return newCount;
  } catch (error) {
    await notifyMe("error in user monthly quota handler", error);
    // Fail Safe: If Redis dies, maybe return -1 or allow access?
    // Usually better to fail open (allow) than block legitimate users.
    return 1;
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
