import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
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

export const ProcessUserQuery = async (user, queryType) => {
  const user_id = user.user_id;
  const Monthly_Quota = parseInt(process.env.USER_QUOTA_LIMIT || 20); // Always parse env vars

  // 1. Premium Check (Fastest exit)
  if (user.PaymentStatus === true) {
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
async function updateDbQuota(user_id, monthKey, count) {
  // We use upsert so it handles both "Update" and "Insert new month" logic
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
  // Format: "2026-01" (YYYY-MM)
  const currentMonthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  const redisKey = `quota:${user_id}:${currentMonthKey}`;

  const CACHE_TTL = 86400;

  try {
    // If key doesn't exist, Redis returns 1.
    // We need to verify if this is a "real" 1 (new month) or a "fake" 1 (cache expired).
    const exists = await redisClient.exists(redisKey);

    let newCount;

    if (exists) {
      // --- SCENARIO A: Cache Hit (Fast Path) ---
      if (query_type === "Synthesis") {
        newCount = await redisClient.incrBy(redisKey, 2);
      } else {
        newCount = await redisClient.incr(redisKey);
      }

      // OPTIONAL: Update DB asynchronously (Fire and Forget)
      // We don't await this because we don't want to slow down the user.
      // We assume Redis is the source of truth for the active session.
      updateDbQuota(user_id, currentMonthKey, newCount);
    } else {
      // --- SCENARIO B: Cache Miss (Redis expired or New Month) ---

      // A. Get the "True" count from Supabase
      const { data, error } = await supabase
        .from("Question_Rate_Limits")
        .select("question_asked_count")
        .eq("user_id", user_id)
        .eq("Month-Year", currentMonthKey)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error on empty rows

      // B. Determine starting point
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
