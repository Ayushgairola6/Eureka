import { redisClient } from "../CachingHandler/redisClient.js";
import { generateChartData } from "../controllers/ModelController.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import { HandleNewInstructions } from "./VerificationModeWebSearchHandler.js";
import { GetResearchData } from "./VerificationModeWebSearchHandler.js";
// first level agent handler
//compression and decompression logic starts here
import { promisify } from 'util';
import zlib from 'zlib';
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

// Helper to read compressed cache
async function getCompressedCache(key) {
  const compressed = await redisClient?.withCommandOptions({ returnBuffers: true }).get(key)
  if (!compressed) return null;
  const json = (await inflate(compressed)).toString();
  return JSON.parse(json);
}

// Helper to write compressed cache
async function setCompressedCache(key, value, ttl = 3600) {
  const json = JSON.stringify(value);
  const compressed = await deflate(json);
  await redisClient.set(key, compressed, 'EX', ttl);
}

// get pending research
// export const GetPendingResearch = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user)
//       return res.status(401).json({ message: "Please login to continue" });

//     const { timestamp } = req.query;
//     const cacheKey = `user=${user.user_id}:research-history`;

//     // First fetch - get latest 5 records
//     if (!timestamp) {
//       const cachedResearchHistory = await getCompressedCache(cacheKey)

//       if (cachedResearchHistory) {
//         return res.status(200).json({
//           message: "Found",
//           history: JSON.parse(cachedResearchHistory),
//         });
//       }

//       const { data, error } = await supabase
//         .from("research_data")
//         .select("*")
//         .eq("user_id", user.user_id)
//         .eq("isSynthesized", false)
//         .order("created_at", { ascending: false }) // Newest first
//         .limit(5);

//       if (error || !data || data.length === 0) {
//         return res.status(404).json({
//           message: "No pending research found.",
//           history: [],
//         });
//       }

//       await setCompressedCache(cacheKey, data, 3600) // 1 hour expiry

//       return res.status(200).json({
//         message: "Research found",
//         history: data,
//       });
//     }

//     // Pagination fetch - get older records
//     const cachedResearchHistory = await redisClient.get(cacheKey);
//     let existingHistory = cachedResearchHistory
//       ? JSON.parse(cachedResearchHistory)
//       : [];

//     const { data, error } = await supabase
//       .from("research_data")
//       .select("*")
//       .eq("user_id", user.user_id)
//       .eq("isSynthesized", false)
//       .order("created_at", { ascending: false })
//       .lt("created_at", timestamp) // Older than timestamp
//       .limit(5);

//     if (error) {
//       return res.status(404).json({
//         message: "Unable to fetch more research.",
//         history: existingHistory,
//       });
//     }

//     if (!data || data.length === 0) {
//       return res.status(200).json({
//         message: "No more research to load",
//         history: existingHistory,
//         hasMore: false,
//       });
//     }

//     // Merge: existing (newer) + new (older)
//     const updatedHistory = [...existingHistory, ...data];

//     await setCompressedCache(cacheKey, updatedHistory, 3600)

//     return res.status(200).json({
//       message: "Research found",
//       history: updatedHistory,
//       hasMore: data.length === 5, // If we got 5, there might be more
//     });
//   } catch (error) {
//     notifyMe(`Error in GetPendingResearch handler for analyst mode`, error);
//     console.error(error);
//     return res.status(500).json({
//       message: "Server error. Please try again.",
//       history: [],
//     });
//   }
// };
export const GetPendingResearch = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Please login to continue" });

    const { timestamp } = req.query;
    const cacheKey = `user=${user.user_id}:research-history`;

    if (!timestamp) {
      const cached = await getCompressedCache(cacheKey);
      if (cached) {
        return res.status(200).json({ message: "Found", history: cached });
      }

      const { data, error } = await supabase
        .from("research_data")
        .select("*")
        .eq("user_id", user.user_id)
        .eq("isSynthesized", false)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error || !data || data.length === 0) {
        return res.status(404).json({ message: "No pending research found.", history: [] });
      }

      await setCompressedCache(cacheKey, data, 3600);
      return res.status(200).json({ message: "Research found", history: data });
    }

    // Pagination
    let existing = await getCompressedCache(cacheKey) || [];

    const { data, error } = await supabase
      .from("research_data")
      .select("*")
      .eq("user_id", user.user_id)
      .eq("isSynthesized", false)
      .order("created_at", { ascending: false })
      .lt("created_at", timestamp)
      .limit(6);

    if (error) {
      return res.status(404).json({ message: "Unable to fetch more research.", history: existing });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ message: "No more research to load", history: existing, hasMore: false });
    }

    const updated = [...existing, ...data];
    await setCompressedCache(cacheKey, updated, 3600);
    return res.status(200).json({ message: "Research found", history: updated, hasMore: data.length === 5 });
  } catch (error) {
    notifyMe(`Error in GetPendingResearch handler for analyst mode`, error);
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again.", history: [] });
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
    // if (plan_status === "free" || plan_status === "sprint pass") {
    //   return res
    //     .status(400)
    //     .json({ message: "These features are only limited to pro plans" });
    // }

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
    // const cacheKey = `user=${user.user_id}:research-history`;

    await redisClient.del(cacheKey);

    const { data, error } = await supabase
      .from("research_data")
      .select("*")
      .eq("user_id", user.user_id)
      .eq("isSynthesized", false)
      .order("created_at", { ascending: false }) // Newest first
      .limit(6);

    if (error || !data || data.length === 0) {
      return res.status(404).json({
        message: "No pending research found.",
        history: [],
      });
    }

    // await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 }); // 1 hour expiry

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
  try {
    if (!report_id || typeof report_id !== "string")
      return { status: false, error: "Invalid or missing report_id" };

    const { error } = supabase
      .from("research_data")
      .update({ isSynthesized: true })
      .eq("message_id", report_id);

    if (error) {
      notifyMe(
        `Error while updating the report status for report_id=${report_id} in the UpdateReportStatus function`,
        error
      );
      return {
        status: false,
        error: "Unable to update the report status at the moment",
      };
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to mark this thread as done." });
  }
}

const processing = new Set(); /// a set to keep track of currently processing MessageIds to prevent concurrent processing
// handle data visualization request
export async function Visualize(req, res) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Please login to continue" });

    const {
      status,
      error: plan_error,
      plan_type,
      plan_status,
    } = await CheckUserPlanStatus(user?.user_id);

    //if the user is not paid or the paid staus is not even available
    if (status === false || plan_error || !plan_type) {
      notifyMe(
        `There was an error while checking the payment status and information of user=${req.user.username} in the analyst mode report finalize report handler`,
        null
      );
      return res.status(400).send({
        message:
          "An error occured while checking your payment status please contact our support at support@antinodeai.space to report this issue",
      });
    }

    // free & sprint pass not allowed
    // if (plan_type === "free" || plan_type === "sprint pass") {
    //   return res.status(400).json({
    //     message:
    //       "Visualization is only available for premium plans, upgrade to start visualizing",
    //   });
    // }
    const { MessageId } = req.body;

    if (!MessageId || typeof MessageId !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing MessageId or userQuery" });
    }

    // request lock key
    if (processing.has(MessageId)) {
      return res.status(429).json({
        message:
          "A visualization request for this research is already being processed.",
      });
    }
    processing.add(MessageId);

    const Information = await GetResearchData(MessageId);
    // create a report
    if (!Information || Information.error) {
      return res.status(400).json({
        message:
          "Seems like our AI models are overloaded right now please stand by while we try to fix this problem, you can continue this research from your archive.",
      });
    }

    const og_query =
      Information.data[0]?.query ||
      "No user query found; please create the most insightful chart based on the data.";

    const allQueries = Information.data.flatMap((item) => {
      // Try information.queries first (database), then item.queries (cache), else empty
      const queries = item.information?.queries || item.queries || [];
      return queries;
    });
    const searchQueriesStr = allQueries.length
      ? `Search queries used: ${allQueries.join("; ")}`
      : "";
    // console.log(query, "query");
    const raw_data = Information.data
      .flatMap((item) => {
        // details could be directly on item (cache) or inside information (database)
        const details = item.details || item.information?.details || [];
        return details.map((source) => {
          const snippet =
            source.content.length > 3000
              ? source.content.slice(0, 3000) + "… [truncated]"
              : source.content;
          return `Source: ${source.url}\nContent: ${snippet}`;
        });
      })
      .join("\n---\n");

    if (!raw_data || raw_data.length === 0) {
      return res.status(400).json({
        message:
          "There is no data found for this research, unable to generate visualization",
      });
    }

    const modelResponse = await generateChartData(
      `original_first_query:${og_query}&further_research_queries:${searchQueriesStr}`,
      JSON.stringify(raw_data)
    );

    if (
      !modelResponse ||
      modelResponse?.error ||
      modelResponse?.chart_type === "none"
    ) {
      return res.status(404).json({ message: "Unable to visualize the data" });
    }

    const results = {
      title: modelResponse.title || "No title",
      reasoning: modelResponse.reasoning || "No reasoning provided",
      chart_type: modelResponse.chart_type || "No chart type provided",
      labels: modelResponse.labels || [],
      datasets: modelResponse.datasets || [],
      MessageId: MessageId,
    };

    const { error } = await supabase.from("artifacts").insert({
      user_id: user.user_id,
      message_id: MessageId,
      name: `Research_visualization`,
      data: results,
    });

    if (error) {
      notifyMe("Data visualization error\n", error);
    }

    return res.json({ message: "Visualization generated", results });
  } catch (error) {
    console.error(`Data visualition error\n`, error);
    return res
      .status(500)
      .json({ message: "Our model failed to visualize this data" });
  } finally {
    const { MessageId } = req.body;

    processing.delete(MessageId); // always release
  }
}

// fetch artifacts
// export async function GetArtifacts(req, res) {
//   // complee this function by fetching the data from artifacts table supabase with a limit and pagination using created_at
//   const user = req.user;
//   if (!user)
//     return res.status(401).json({ message: "Please login to continue" });

//   const { timestamp, request_type } = req.query;
//   const cacheKey = `user=${user.user_id}:artifacts`;

//   if (request_type === "refresh") {
//     const data = await redisClient.get(cacheKey);
//     if (data) {
//       return res.status(200).json({
//         message: "Artifacts found",
//         artifacts: JSON.parse(data),
//         hasMore: JSON.parse(data).length === 5,
//       });
//     }
//   }
//   let query;
//   if (timestamp) {
//     query = supabase
//       .from("artifacts")
//       .select("*")
//       .eq("user_id", user.user_id)
//       .order("created_at", { ascending: false })
//       .lt("created_at", timestamp) // Older than timestamp
//       .limit(5);

//     const old_data = await redisClient.get(cacheKey);
//     const parsed = JSON.parse(old_data) || [];
//     const merged = [...parsed, ...(query.data || [])];
//     await redisClient.set(cacheKey, JSON.stringify(merged), { EX: 3600 });
//   }
//   query = supabase
//     .from("artifacts")
//     .select("*")
//     .eq("user_id", user.user_id)
//     .order("created_at", { ascending: false })
//     .limit(5);

//   const { data, error } = await query;
//   if (!data || data.length === 0 || error) {
//     console.error("Error fetching artifacts:", error);
//     return res.status(404).json({ message: "Unable to find any artifacts " });
//   }

//   await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 }); // cache for 1 hour
//   return res.status(200).json({
//     message: "Artifacts found",
//     artifacts: data,
//     hasMore: data.length === 5,
//   });
// }
export async function GetArtifacts(req, res) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Please login to continue" });

  const { timestamp, request_type } = req.query;
  const cacheKey = `user=${user.user_id}:artifacts`;

  if (request_type === "refresh") {
    const data = await getCompressedCache(cacheKey);
    if (data) {
      return res.status(200).json({ artifacts: data, hasMore: data.length === 5 });
    }
  }

  let query;
  if (timestamp) {
    query = supabase
      .from("artifacts")
      .select("*")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: false })
      .lt("created_at", timestamp)
      .limit(5);

    const old = await getCompressedCache(cacheKey) || [];
    const merged = [...old, ...(query.data || [])];
    await setCompressedCache(cacheKey, merged, 3600);
  } else {
    query = supabase
      .from("artifacts")
      .select("*")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: false })
      .limit(5);
  }

  const { data, error } = await query;
  if (!data || data.length === 0 || error) {
    console.error("Error fetching artifacts:", error);
    return res.status(404).json({ message: "Unable to find any artifacts" });
  }

  await setCompressedCache(cacheKey, data, 3600);
  return res.status(200).json({ message: "Artifacts found", artifacts: data, hasMore: data.length === 5 });
}
