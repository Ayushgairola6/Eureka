import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

export const GetPendingResearch = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Please login to continue" });

    const cacheKey = `user=${user.user_id} research-history`;
    const cachedResearchHistory = await redisClient.get(cacheKey);

    if (cachedResearchHistory) {
      return res
        .status(201)
        .json({ message: "Found", history: JSON.parse(cachedResearchHistory) });
    }

    const { data, error } = await supabase
      .from("research_data")
      .select("*")
      .eq("user_id", user.user_id);

    if (error)
      return res
        .status(404)
        .json({ message: "Unable to find any pending research for you." });

    await redisClient
      .multi()
      .set(cacheKey, JSON.stringify(data))
      .exec()
      .catch((err) =>
        notifyMe(
          "There is an error in the get pending research handler for analyst mode",
          err
        )
      );

    return res.status(201).json({
      message: "Research found",
      history: data,
    });
  } catch (error) {
    notifyMe(
      `There was an error in the getting pending request research handler for analyst mode`,
      error
    );
    console.error(error);
    return res.status(500).json({
      message:
        "We are trying to resolve this problem, thanks for your patience.",
    });
  }
};
