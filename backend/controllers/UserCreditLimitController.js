import { supabase } from "./supabaseHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

// this function will check the current limit of the user / that means if the user is within the limit of their quota this will let them proceed else will stop them from continuing

export const CheckCreditLimitPerUser = async (user_id) => {
  try {
    // date object to match the values from cache or db
    const today = new Date().toISOString().split("T")[0];
    //  cache key for the user
    const UserQueryLimitKeyForUser = `User=${user_id}'s_credit_limit_key_day=${today}`;

    // if the cache data exists in the memory
    const exists = await redisClient.exists(UserQueryLimitKeyForUser);
    if (exists) {
      const CachedCreditLimit = await redisClient.hGetAll(
        UserQueryLimitKeyForUser
      );

      if (CachedCreditLimit && Object.keys(CachedCreditLimit).length > 0) {
        const parsedInfo = {
          question_asked_count:
            parseInt(CachedCreditLimit.question_asked_count) || 0,
          added_at: CachedCreditLimit.added_at,
        };

        // Validate the cached date matches today
        if (parsedInfo.added_at.split("T")[0] === today) {
          return {
            message: "Current Credit record found",
            value: parsedInfo,
          };
        }
        // If cached data is from previous day, delete it
        await redisClient.del(UserQueryLimitKeyForUser);
      }
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("Question_Rate_Limits")
      .select("question_asked_count, added_at")
      .eq("user_id", user_id)
      .gte("added_at", `${today}T00:00:00.000Z`)
      .lte("added_at", `${today}T23:59:59.999Z`)
      .single();

    if (error || !data) {
      return {
        message: "No record found for today",
        value: null,
      };
    }

    // Calculate TTL until end of day
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const ttl = Math.floor((endOfDay - now) / 1000);

    // Cache with proper TTL
    await redisClient.hSet(UserQueryLimitKeyForUser, data);
    await redisClient.expire(UserQueryLimitKeyForUser, ttl);

    return {
      message: "Current Credit record found",
      value: data,
    };
  } catch (error) {
    await notifyMe("Error in CheckCreditLimitPerUser helper function", error);
    return { message: "Something went wrong" };
  }
};

// this function will update the values in the cache as well as the db
export const UpdateUserCreditLimit = async (user_id) => {
  const client = redisClient; // Use pipeline for atomic operations
  const today = new Date().toISOString().split("T")[0];
  const UserQueryLimitKeyForUser = `User=${user_id}'s_credit_limit_key_day=${today}`;

  try {
    // Use Redis pipeline for atomic operations to execute uninterrupted updates for each user
    const pipeline = client.multi();

    // Check and increment atomically using HINCRBY
    pipeline.hIncrBy(UserQueryLimitKeyForUser, "question_asked_count", 1);
    pipeline.hGet(UserQueryLimitKeyForUser, "added_at");

    const results = await pipeline.exec();
    const [newCount, addedAt] = results;

    if (addedAt) {
      // Record exists in cache, update database
      const { error } = await supabase
        .from("Question_Rate_Limits")
        .update({ question_asked_count: parseInt(newCount) })
        .eq("user_id", user_id)
        .gte("added_at", `${today}T00:00:00.000Z`)
        .lte("added_at", `${today}T23:59:59.999Z`);

      if (error) {
        // Rollback cache if DB update fails
        await client.hIncrBy(
          UserQueryLimitKeyForUser,
          "question_asked_count",
          -1
        );
        return { message: "Error updating record", error: true };
      }

      return { message: "The value has been incremented" };
    } else {
      // No record exists, create new one
      const now = new Date().toISOString();
      const newRecord = {
        user_id: user_id,
        question_asked_count: 1,
        added_at: now,
      };

      const { error: insertError } = await supabase
        .from("Question_Rate_Limits")
        .insert([newRecord]);

      if (insertError) {
        await client.del(UserQueryLimitKeyForUser); // Clean up cache
        return { message: "Error creating new record", error: true };
      }

      // Set cache with new record
      await client.hSet(UserQueryLimitKeyForUser, {
        question_asked_count: "1",
        added_at: now,
      });

      // Set TTL until end of day
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); //right before ending of 24 hours
      // to convert it into seconds
      const ttl = Math.floor((endOfDay - new Date()) / 1000);
      await client.expire(UserQueryLimitKeyForUser, ttl); //delte the cache data

      return { message: "New record has been created and cached" };
    }
  } catch (error) {
    await notifyMe("Error in UpdateUserCreditLimit helper function", error);
    return { message: "Something went wrong", error: true };
  }
};

// this method will call and update the values based on the credit current limit of users
export async function HandleUserCreditCachingOrUpdationOrCreation(user) {
  try {
    const today = new Date().toISOString().split("T")[0];
    // checking the users quota status
    const { message, value } = await CheckCreditLimitPerUser(user.user_id);

    const IsPremiumUser = user.PaymentStatus; //users paid status

    // Premium users have no limits
    if (IsPremiumUser === true) {
      return { message: "Premium user - no limits", status: "ok" };
    }

    // Free tier user handling
    if (message.includes("No record found for today")) {
      await UpdateUserCreditLimit(user.user_id); //creating a new record for the user
      return {
        message: "First query of the day - record created",
        status: "ok",
      };
    } else if (message.includes("Current Credit record found") && value) {
      // Additional safety check for date mismatch
      if (value.added_at.split("T")[0] !== today) {
        await UpdateUserCreditLimit(user.user_id);
        return { message: "New day - record reset", status: "ok" };
      }

      if (value.question_asked_count >= 14) {
        //free user reaching their daily quota
        return {
          message:
            "You have reached your free tier limit for the day. It will reset tomorrow. To experience unlimited queries and other premium features consider becoming our premium member.",
          status: "not ok",
        };
      } else {
        await UpdateUserCreditLimit(user.user_id);
        return {
          message: `Query ${value.question_asked_count + 1} of 14`,
          status: "ok",
        };
      }
    }

    // Fallback for unexpected states
    return { message: "Unable to determine credit status", status: "not ok" };
  } catch (error) {
    await notifyMe(
      "Error in HandleUserCreditCachingOrUpdationOrCreation",
      error
    );
    return { message: "Service temporarily unavailable", status: "not ok" };
  }
}
