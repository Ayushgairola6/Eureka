import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import { HandleNewInstructions } from "./VerificationModeWebSearchHandler.js";

// first level agent handler

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
      .eq("user_id", user.user_id)
      .eq("isSynthesized", false);

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

// handler resume pending research

export const ResumePendingThread = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ message: "Please authenticate yourself to continue" });

    const { MessageId, web_search_depth, room_id } = req.body;

    if (!MessageId)
      return res.status(400).json({
        message: "A valid research id is needed to continue pending progress",
      });

    const { status, error, plan_type, plan_status, decision_type } =
      await CheckUserPlanStatus(user.user_id);

    //if the user is not paid or the paid staus is not even available
    if (status === false || error || !plan_type) {
      notifyMe(
        `There was an error while checking the payment status and information of user=${req.user.username} in the analyst mode report finalize report handler`,
        null
      );
      return res.status(400).send({
        message:
          "An error occured while checking your payment status please contact our support at support@antinodeai.space to report this issue",
      });
    }
    // validate payment status
    if (plan_status === "free" || plan_status === "sprint pass") {
      return res
        .status(400)
        .json({ message: "These features are only limited to pro plans" });
    }

    // validate quota
    const rateLimitStatus = await ProcessUserQuery(user, "Analyst");
    if (rateLimitStatus?.status === false) {
      return res.status(400).send({
        message:
          "You have exhausted your monthly quota, please wait till next month or get our premium pass and experience all features without any limits",
        Answer:
          "You have exhausted your monthly quota, please wait till next month or get our premium pass and experience all features without any limits",
      });
    }

    // handle new instructions
    const newResearchResults = await HandleNewInstructions(
      "continue this further based on the request",
      {
        user,
        user_prompt: "no specific prompt",
        plan_type,
        web_search_depth,
        MessageId,
        room_id,
      }
    );

    if (newResearchResults.error) {
      return res.status(400).json({
        message: "Something went wrong while proceeding with your request",
      });
    }
    return res
      .status(newResearchResults.data.status === "partial" ? 206 : 200)
      .json({
        message: "Research done",
        MessageId: newResearchResults.data.MessageId,
        research_data: newResearchResults.data.research_data,
        status: newResearchResults.data.status,
        direct_answer: newResearchResults.direct_answer,
      });
  } catch (error) {
    console.error(error);
    // notifyMe(
    //   "An error occured in the resumepending research handler for the analyst mode",
    //   error
    // );
    return res.status(500).json({
      message: "The research continuation is not possible at the moment",
    });
  }
};

// extracts tool name
export function CheckInstructionsStatus(instructions) {
  const QUICK_TAGS = [
    { dig_deeper: "Go deeper on this topic with more authoritative sources." },
    {
      find_more:
        "Cross-verify the key claims with additional independent sources.",
    },
  ];

  if (instructions === QUICK_TAGS.dig_deeper || instructions.find_more) {
    return { isHardcoded: true, isUnique: false };
  }

  return { isHardcoded: false, isUnique: true };
}

// if users want to refresh their archive because some date does not reflect
export async function RefreshArchive(req, res) {
  try {
    const user = req.user;

    if (!user)
      return res.status(401).json({ message: "Please login to continue" });

    // clear te cache
    const cacheKey = `user=${user?.user_id} research-history`;
    await redisClient.del(cacheKey);

    const { data, error } = await supabase
      .from("research_data")
      .select("*")
      .eq("user_id", user.user_id)
      .eq("isSynthesized", false);

    if (error)
      return res
        .status(404)
        .json({ message: "Unable to find any pending research for you." });

    // then cache it
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
    return res.status(500).json({ message: "Internal sever error" });
  }
}

// mark the research thread as done
export async function MarkResearchDone(req, res) {
  try {
    const user = req.user;

    if (!user)
      return res.status(401).json({ message: "Please login to continue" });

    const { message_id } = req.body;
    if (!message_id || typeof message_id !== "string")
      return res.status(400).json({ message: "Invalid or missing thread_id " });

    const { error } = await supabase
      .from("research_data")
      .update("isSynthesized", true)
      .eq("message_id", message_id);

    if (error)
      return res.status(400).json({
        message:
          "Something went wrong while updating your preference, please wait and try again later",
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal sever error" });
  }
}

//update report status
export async function UpdateReportStatus(report_id) {
  if (!report_id || typeof report_id !== "string")
    return { status: false, error: "Invalid or missing report_id" };

  supabase
    .from("research_data")
    .update({ isSynthesized: true })
    .eq("message_id", report_id);
}
