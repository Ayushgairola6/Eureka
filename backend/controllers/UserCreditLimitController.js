import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
dotenv.config();
//handles limit check and update all at once
export async function GlobalRequestRateLimit(req, res, next) {
  const LIMIT = parseInt(process.env.AGENT_REQUESTS_PER_MINUTE) || 10;
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

  const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
    user_id
  );
  if (!status || error) {
    console.log(status, error, "error ans staus from checkUserPlan");
    return {
      status: false,
      message: "Something went wrong with the plan status check",
    };
  }

  if (
    plan_status === "active" &&
    plan_type &&
    plan_type !== "free" &&
    plan_type !== "sprint pass"
  ) {
    console.log("The user is on premium pass so let them pass");
    return { status: true, message: "Premium user - no limits" };
  }

  const Monthly_Quota = parseInt(process.env.USER_FREE_QUOTA_LIMIT || 20);

  try {
    const CurrentCount = await CheckQuotaInCacheAndDB(user_id, queryType);

    if (CurrentCount > Monthly_Quota) {
      return {
        status: false,
        message: "You have exhausted your monthly quota",
      };
    }

    return { status: true };
  } catch (error) {
    await notifyMe("Rate Limit Error", error);
    return { status: true, message: "System bypass" };
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
    { onConflict: ["user_id", "Month-Year"] }
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
      await redisClient
        .multi()
        .set(redisKey, newCount)
        .expire(redisKey, CACHE_TTL);

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
export const CheckUserContributionCount = async (
  user,
  plan_type,
  plan_status
) => {
  const UserAccountDataKey = `user_id=${user.user_id}'s_dashboardData`;
  let contributionCount = 0;

  try {
    const cacheData = await redisClient.hGet(
      UserAccountDataKey,
      "Contributions"
    );

    if (cacheData) {
      const parsed = JSON.parse(cacheData);
      contributionCount = Array.isArray(parsed) ? parsed.length : 0;
    } else {
      // Fallback to DB
      const { data, error, count } = await supabase
        .from("Contributions")
        .select("document_id", { count: "exact", head: true }) // head: true is faster if you only need count
        .eq("user_id", user.user_id)
        .eq("Document_visibility", "Private");

      if (error) throw error;
      contributionCount = count || 0;
    }

    // Centralized Limit Logic
    const limits = {
      free: 2,
      "sprint pass": 5,
      unlimited: Infinity, // Future proofing
    };

    const userLimit = limits[plan_type] || 0;

    if (plan_type === "free" && contributionCount >= userLimit) {
      console.log();
      return { message: "Limit reached", count: contributionCount };
    }

    return { message: "within limit", count: contributionCount };
  } catch (error) {
    await notifyMe("Error in CheckUserContributionCount", error);
    return { error: "Failed to verify limits" };
  }
};
