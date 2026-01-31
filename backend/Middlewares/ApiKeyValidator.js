import { supabase } from "../controllers/supabaseHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";

// Apikey validation and caching handler middleware for ratelimit and performance
export const ValidateApiKey = async (req, res, next) => {
  try {
    const Authheaders = req.headers.authorization;
    const user_api_key = Authheaders?.split(" ")[1];

    if (!Authheaders || !user_api_key) {
      return res.status(400).json({ message: "Invalid API key" });
    }

    const UserCachedAPIredisKey = `api_key:${user_api_key}`; //for quick lookups
    const rateLimitKey = `rate_limit:${user_api_key}`; //for rate limit quick lookups

    // Rate limiting check
    const currentRequests = await redisClient.incr(rateLimitKey);
    if (currentRequests === 1) {
      console.log("Rate limiting working");
      await redisClient.expire(rateLimitKey, 60);
    }

    if (currentRequests > 100) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Maximum 30 requests per minute.",
        retryAfter: 60,
        currentlimit: 30,
        window: "1 minute",
      });
    }

    // Cache lookup
    const cachedUserInfo = await redisClient.get(UserCachedAPIredisKey);
    if (cachedUserInfo) {
      req.user = JSON.parse(cachedUserInfo);
      return next();
    }

    // Database lookup with shorter cache time for frequently changing data
    const { data, error } = await supabase
      .from("API_KEYS")
      .select("user_id, users(email,username)")
      .eq("API_KEY", user_api_key)
      .single();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ message: "Invalid API_KEY" });
    }

    await redisClient
      .multi()
      .set(UserCachedAPIredisKey, JSON.stringify(data))
      .expire(UserCachedAPIredisKey, 1500);

    req.user = data;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
