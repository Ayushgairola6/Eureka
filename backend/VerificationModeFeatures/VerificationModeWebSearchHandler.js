import {
  CacheCurrentChat,
  redisClient,
} from "../CachingHandler/redisClient.js";
import { HandleDeepWebResearch } from "../controllers/FeaturesController.js";
import {
  currentTime,
  fetchSearchResults,
  StoreQueryAndResponse,
} from "../controllers/fileControllers.js";
import {
  FindIntent,
  HandleInference,
  StructuredOutPutInferenceHandler,
  Summarize,
} from "../controllers/GroqInferenceController.js";
import { GenerateResponse } from "../controllers/ModelController.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import { GetDataFromSerpApi } from "../OnlineSearchHandler/serpapi_handler.js";
import {
  DeepScraper,
  FilterUrlForExtraction,
  FormattForLLM,
  ProcessForLLM,
  SerpWeb,
} from "../OnlineSearchHandler/WebCrawler.js";
import { ANALYST_PROMPT, VerificationModePrompt } from "../Prompts/Prompts.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { CheckAndExpireThreadId, FilterHighValueSources } from "./helpers.js";
import {
  CheckInstructionsStatus,
  UpdateReportStatus,
} from "./VerificationModeFeatures.js";
import { v4 as uuid } from 'uuid'
// helper function to extract necessary fields from the model response

function ExtractFields(response, data) {
  if (!response)
    return {
      error: "Invalid llm response",
      queries: [],
      score: 0,
    };

  const { user, MessageId } = data;
  const thought = response?.thought;
  // if there is a thought send it
  if (thought) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Agent Thought",
        data: [thought],
      },
    });
  }

  const queries = response?.queries;
  const dorking_queries = response?.dorking_queries;
  const confidence_score = response?.confidence_score;

  const direct_answer = response?.direct_answer;
  return {
    error: null,
    queries: queries || [],
    dorking: dorking_queries || [],
    score: confidence_score || 0,
    direct_answer,
  };
}
// recursive web search orchestration
// Lightweight context tracker — only queries + URLs, no raw content
function BuildIterationContext(previousContext, newQueries, newSummaries = [], raw_content) {
  return {
    queries: [...(previousContext.queries || []), ...newQueries],
    urls: [...(previousContext.urls || [])],  // keep existing URLs
    summaries: [...(previousContext.summaries || []), ...newSummaries],
    raw_content: [...(previousContext.raw_content || []), ...raw_content || []]
  };
}

// Formats context into a compact LLM-safe string (minimal tokens)
function FormatContextForLLM(context) {
  let result = "";
  if (context.queries?.length) {
    result += `previous_queries=${context.queries.join(",")}&`;
  }
  if (context.summaries?.length) {
    result += `previous_findings=${context.summaries.map(s => s.content_summary).join(" | ")}&`;
  }
  return result.slice(0, -1); // remove trailing &
}

// mergse raw results
function mergeRawResults(rawResultsArray) {
  const allUrls = new Set();
  const allFavicons = new Set();
  const allFinalContent = [];

  for (const raw of rawResultsArray) {
    if (raw?.urls) raw.urls.forEach(u => allUrls.add(u));
    if (raw?.favicons) raw.favicons.forEach(f => allFavicons.add(f));
    if (raw?.FinalContent) allFinalContent.push(...raw.FinalContent);
  }

  return {
    urls: Array.from(allUrls),
    favicons: Array.from(allFavicons),
    FinalContent: allFinalContent
  };
}
// recursive orchestrator
async function WebSearchOrchestrator(
  iteration = 0,
  data,
  iterationContext = { queries: [], urls: [], raw_content: [] }
) {
  try {
    const {
      user,
      user_prompt,
      plan_type,
      web_search_depth,
      MessageId,
      room_id, thread_id
    } = data;

    const iterationLimit = web_search_depth === "deep_web" ? 8 : 4;

    if (iteration >= iterationLimit) {
      let mergeResults;

      if (iterationContext.raw_content && iterationContext.raw_content.length > 0) {
        mergeResults = mergeRawResults(iterationContext.raw_content);
      }

      if (user?.user_id) {
        EmitEvent(user?.user_id, "Research_Done", {
          message: 'Research partially done due to some server side issue',
          MessageId: MessageId,
          research_data: mergeResults,
          status: "partial",
          direct_answer: null,
        })
      }
      return {
        error: mergeResults ? null : "Iteration limit reached without gathering data",
        data: mergeResults ? { data: mergeResults } : null,
        MessageId,
        iteration,
        queries: iterationContext?.queries,
        direct_answer: null,
      };
    }

    // Build a lean prompt — only pass previous queries+urls, not raw content
    const contextString = FormatContextForLLM(iterationContext);
    const llmPrompt = `**user_request**:${user_prompt} **context**:${contextString}&iteration_count=${iteration}_max_iteration_limits=${iterationLimit}`;


    const { result, error } = await StructuredOutPutInferenceHandler(
      llmPrompt,
      VerificationModePrompt
    );
    // if failed retry
    if (
      !result || error
    ) {
      return {
        error: "Failed to generate a response",
        data: null,
        MessageId,
        iteration,
        queries: iterationContext.queries || [],
        direct_answer: null,
      };

    }

    const extractedInformation = ExtractFields(result, {
      user,
      MessageId,
    });


    if (extractedInformation.error || !extractedInformation.queries) {
      notifyMe("Orchestrator crashed\n", extractedInformation?.error);
      return {
        error: extractedInformation.error,
        data: null,
        MessageId,
        iteration,
        direct_answer: null,
      };


    }


    if (extractedInformation.queries?.length > 0 || extractedInformation.dorking.length > 0) {
      const results = await SurfaceWebSearchRequst({ queries: extractedInformation.queries, dorking: extractedInformation.dorking }, {
        user,
        plan_type,
        MessageId,
        user_prompt,
        room_id, thread_id
      });
      // console.log("Search results", results);


      if (results.error) {
        const updatedContext = BuildIterationContext(
          iterationContext,
          extractedInformation.queries,
          results.summaries || [],//the search summary
          results.data,

        );

        return WebSearchOrchestrator(iteration + 1, data, updatedContext);
      }

      return {
        error: null,
        data: results,
        MessageId,
        iteration,
        queries: extractedInformation.queries,
        direct_answer: null,
      };

      // Results came back empty — track what we tried and retry

    }

    // Low confidence — track queries tried, ask LLM to be more specific next round
    const updatedContext = BuildIterationContext(
      iterationContext,
      extractedInformation.queries,
      []
      , []
    );

    return WebSearchOrchestrator(iteration + 1, data, updatedContext);
  } catch (error) {
    notifyMe("Analyst mode orchestration error\n crashed", error);
    return {
      error: "Failed to find any results",
      data: null,
      MessageId: data.MessageId,
      iteration,
      queries: [],
      direct_answer: null,
    };
  }
}

//helper function for deep-search request
export async function DeepSearchRequest(FormattedQueries, data) {
  try {
    const {
      user,
      user_prompt: userQuery,
      MessageId,
      room_id,
      plan_type,
    } = data;

    const FinalLinksToScrape = await HandleDeepWebResearch(
      FormattedQueries,
      user,
      room_id,
      MessageId,
      plan_type
    );

    if (FinalLinksToScrape?.length === 0) {
      return {
        error: "No links found for your search results",
        data: null,
      };
    }

    const LinksToFetch = [];
    // handle each source links extraction
    FinalLinksToScrape.forEach((li) => {
      if (li) {
        const data = FilterUrlForExtraction(li, user);
        LinksToFetch.push(data);
      }
    });

    const FlatLinks = LinksToFetch.flat();

    if (FlatLinks.length === 0) {
      return { error: "No links found for your search results", data: null };
    }

    // web send the links to the crawler to scrape and process
    const CleanedWebData = await ProcessForLLM(
      FlatLinks,
      user,
      userQuery,
      MessageId,
      room_id,
      plan_type
    );
    if (!CleanedWebData || CleanedWebData.length === 0) {
      return {
        error: "It took too long to process the sources, please try again",
        data: null,
      };
    }

    const FormattedResearchData = FormattForLLM(CleanedWebData);

    if (FormattedResearchData.error) {
      return { error: "The processedInformation was not enough", data: null };
    }
    // we put the results in the webResults array
    return { error: null, data: FormattedResearchData };
  } catch (error) {
    return { error: error, data: null };
  }
}

// helper function for surface web verifiaction mode request
async function SurfaceWebSearchRequst(searchQuery, data) {
  try {
    const { user, plan_type, MessageId, user_prompt: question, room_id, thread_id } = data;
    const { queries, dorking } = searchQuery;

    // 1. Merge queries without mutating the original arrays
    const finalQueries = [...queries, ...dorking];

    if (finalQueries.length === 0) {
      return { error: "No search queries were generated.", data: null };
    }

    EmitEvent(user?.user_id, "query_status", {
      MessageId,
      status: { message: "Searching the web", data: finalQueries },
    });


    const searchPromises = finalQueries.slice(0, 3).map(async (singleQuery) => {
      try {
        // 1. Try Primary API
        const primaryRes = await SerpWeb(singleQuery);

        // Safely extract links (handles different return shapes safely)
        let primaryLinks = primaryRes?.results?.links || primaryRes?.results || [];
        if (!Array.isArray(primaryLinks)) primaryLinks = [];

        // If primary succeeded and has links, return it immediately!
        if (primaryLinks.length > 0) {
          return { links: primaryLinks };
        }


        const secondaryRes = await GetDataFromSerpApi(singleQuery);

        let secondaryLinks = secondaryRes?.response?.links || secondaryRes?.response || [];
        if (!Array.isArray(secondaryLinks)) secondaryLinks = [];

        return { links: secondaryLinks };

      } catch (networkError) {
        // CRITICAL: Catch errors per-query. If one query crashes, we return empty links 
        // instead of letting Promise.all reject and crash the ENTIRE research task.
        notifyMe(`Both SERP APIs failed for query: ${singleQuery}`, networkError);
        return { links: [] };
      }
    });

    // Wait for ALL searches to finish
    const searchResponses = await Promise.all(searchPromises);


    // ==========================================
    // STEP 2: AGGREGATE THE LINKS
    // ==========================================
    // flatMap extracts the 'links' array from each response and flattens them
    const allDiscoveredLinks = searchResponses.flatMap((res) => res.links || []);

    if (allDiscoveredLinks.length === 0) {
      return { error: "There were no results found on the web for your request", data: null };
    }



    EmitEvent(user.user_id, "fetching_url", {
      MessageId,
      status: { message: "Targeted sources selected", data: allDiscoveredLinks },
    });

    // ==========================================
    // STEP 4: SCRAPE ONLY THE WINNERS
    // ==========================================
    const CleanedWebData = await ProcessForLLM(
      allDiscoveredLinks, // <-- ONLY the filtered links go here
      user,
      question,
      MessageId,
      room_id,
      plan_type,
      thread_id
    );

    return { error: null, data: CleanedWebData?.data || CleanedWebData };

  } catch (error) {
    console.error("Surface Web Search Error:", error);
    return { error: error.message || "Search request failed", data: null };
  }
}
// the center of the mode that passes and receives data
export const VerificationModeSearchWeb = async (req, res) => {
  try {
    const user = req?.user;

    if (!user)
      return res
        .status(401)
        .send({ message: "Please login to contiue the session" });

    const { question, web_search_depth, MessageId, userMessageId } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !web_search_depth ||
      typeof web_search_depth !== "string" ||
      !MessageId ||
      typeof MessageId !== "string" ||
      !userMessageId ||
      typeof userMessageId !== "string"
    )
      return res.status(400).json({ message: "Invalid query type" });

    // process the rate limit nd plan status
    const UpdateState = await ProcessUserQuery(user, "analyst");

    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(400).send({
        Answer:
          "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
        message:
          "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
        favicons: { MessageId, icon: [] },
      });
    }

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user.user_id
    );

    //if the user is not paid or the paid staus is not even available
    if (status === false || error || !plan_type) {
      return res.status(400).send({
        message:
          "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
      });
    }
    // free users not allowed
    // if (plan_type === "free" || plan_type === "sprint pass") {
    //   return res.status(403).json({
    //     message:
    //       "This plan does not include analyst mode, if you want to try it please considering upgrading your plan.",
    //   });
    // }
    // orchestrate results

    const research_threadID = uuid() //assign a research_threadID
    const key = `user:${user?.user_id}_created_at:${Date.now()}`
    const hasKey = await redisClient.get(key);

    if (hasKey) {
      return res.status(400).json({ message: "A research thread of yours is already running in the background please wait for it to finish" })
    }
    // push it in the queue with retry mechanism
    try {
      await redisClient.multi().set(key, research_threadID).expire(key, 60000).exec() // 10 min expiry
    } catch (err) {
      await redisClient.multi().set(key, research_threadID).expire(key, 60000).exec().catch((err) => {
        notifyMe("Error while creating a new record for resesearch_threadId even after retry", err);
      })
    }


    // trigger the research orchestration
    await HandleOrchestratedResultsHandling({
      user: req.user,
      question: question,
      plan_type: plan_type,
      web_search_depth: web_search_depth,
      MessageId: MessageId,
      room_id: null,
      thread_id: research_threadID
    });

    return res.json({ message: "Research has started", MessageId })

    // if (!result.success) {
    //   return res
    //     .status(400)
    //     .json({ message: "An error occured while continuing the research!" });
    // }

    // return res.status(result.status === "partial" ? 206 : 200).json({
    //   message: "Research done",
    //   MessageId: result.MessageId,
    //   research_data: result.research_data,
    //   status: result.status,
    //   direct_answer: result?.direct_answer,
    // });
  } catch (error) {
    console.error("Verification search error\n", error);
    return res
      .status(500)
      .json({ message: "An error occured while processing your results." });
  }
};

const deflate = promisify(zlib.deflate);//compressiing

export async function StoreResearchData(research_data, data) {
  try {
    const { MessageId, web_search_depth, user, question } = data;

    if (!research_data || !MessageId) {
      return { error: "Invalid or missing parameters." };
    }

    const cacheKey = `message:${MessageId}:research_report`;

    // ── 1. Redis: compress then store (use SET for a single value) ──
    const fullJson = JSON.stringify(research_data);
    const compressed = await deflate(fullJson);

    const cacheExpiryTime = 60 * 60 * 3; // 3 hours
    await redisClient
      .multi()
      .set(cacheKey, compressed)          // buffer stored as binary-safe string
      .expire(cacheKey, cacheExpiryTime)
      .exec();

    // ── 2. Supabase: store full JSONB as before ──
    const { error: dbInsertionError } = await supabase
      .from("research_data")
      .insert({
        user_id: user?.user_id,
        message_id: MessageId,
        query: question,
        information: {
          sources: research_data.sources,
          favicons: research_data.favicons,
          details: research_data.details,          // full heavy array
          queries: research_data.queries,
        },
        sources_count: research_data.sources.length,
        depth: web_search_depth,
        isSynthesized: false,
      });

    if (dbInsertionError) {
      notifyMe("Error inserting research data into DB", dbInsertionError);
    }

    return { error: null };
  } catch (storageError) {
    console.error("StoreResearchData error:", storageError);
    return { error: storageError };
  }
}

// resurable function to handle orchestrated results
async function HandleOrchestratedResultsHandling(data) {
  const { user, question, plan_type, web_search_depth, MessageId, room_id, thread_id } =
    data;

  const OrchesTratedResults = await WebSearchOrchestrator(0, {
    user,
    user_prompt: question,
    context: "no context",
    plan_type,
    web_search_depth,
    MessageId,
    room_id: room_id, thread_id
  });

  // if there is a direct_answer

  if (OrchesTratedResults?.direct_answer) {
    return {
      success: true,
      status: "complete",
      research_data: null,
      MessageId,
      error: null,
      queries: [],
      direct_answer: OrchesTratedResults?.direct_answer,
    };
  }
  // ── Total failure — nothing to salvage ──────────────────────────────────
  if (OrchesTratedResults?.error && OrchesTratedResults?.iteration === 0) {
    return {
      success: false,
      status: "failed",
      research_data: null,
      MessageId,
      error: OrchesTratedResults.error,
      queries: [],
      direct_answer: null,
    };
  }

  // ── Partial — errored mid-run but has data from a completed iteration ───
  if (OrchesTratedResults?.error && OrchesTratedResults?.iteration > 0) {
    const urls = OrchesTratedResults?.data?.data?.urls || [];
    const favicons = OrchesTratedResults?.data?.data?.favicons || [];
    const FinalResults = OrchesTratedResults?.data?.data?.FinalContent;

    if (!FinalResults) {
      return {
        success: false,
        status: "failed",
        research_data: null,
        MessageId,
        error: null,
        queries: OrchesTratedResults?.queries,
        direct_answer: null,
      };
    }

    const research_data = {
      sources: urls,
      favicons,
      details: FinalResults,
      queries: OrchesTratedResults?.queries || [],
      isSynthesized: false,
    };

    const stored = await StoreResearchData(research_data, {
      MessageId,
      web_search_depth,
      user,
      question,
    });

    return {
      success: true,
      status: "partial",
      research_data,
      MessageId: OrchesTratedResults?.MessageId || MessageId,
      stored: !stored?.error,
      direct_answer: null,
    };
  }

  // ── Full success ─────────────────────────────────────────────────────────
  const urls = OrchesTratedResults?.data?.data?.urls || [];
  const favicons = OrchesTratedResults?.data?.data?.favicons || [];
  const FinalResults = OrchesTratedResults?.data?.data?.FinalContent || [];

  const research_data = {
    sources: urls,
    favicons,
    details: FinalResults,
    queries: OrchesTratedResults?.queries || [],
  };

  const stored = await StoreResearchData(research_data, {
    MessageId,
    web_search_depth,
    user,
    question,
  });

  return {
    success: true,
    status: "complete",
    research_data,
    MessageId: OrchesTratedResults?.MessageId || MessageId,
    stored: !stored?.error,
    direct_answer: null,
  };
}
// final analysis handler when user either wants to synthesize the report or add more instructions
export const FinalAnalyzer = async (req, res) => {
  try {
    const user = req?.user;
    if (!user)
      return res.status(401).send({ message: "Please login to continue the session" });

    const {
      instructions,
      MessageId,
      userMessageId,
      web_search_depth,
      action_type,
    } = req.body;

    if (
      !MessageId || typeof MessageId !== "string" ||
      !userMessageId || typeof userMessageId !== "string"
    )
      return res.status(400).json({
        message:
          "Please choose either you want to proceed further with this researched data, reject it or finalize this for a detailed report.",
      });

    // ── Payment & quota checks ──
    const { status, error, plan_type } = await CheckUserPlanStatus(user.user_id);
    if (status === false || error || !plan_type) {
      notifyMe(`Payment check error for user=${req.user.username} in FinalAnalyzer`, null);
      return res.status(400).send({
        message: "An error occurred while checking your payment status. Please contact support.",
      });
    }

    const rateLimitStatus = await ProcessUserQuery(user, "Analyst");
    if (rateLimitStatus?.status === false) {
      return res.status(400).send({
        message: "You have exhausted your monthly quota. Upgrade to continue.",
        Answer: "You have exhausted your monthly quota. Upgrade to continue.",
      });
    }

    // ── Prevent re‑synthesis ──
    const { data: lookupdata, error: lookupError } = await supabase
      .from("research_data")
      .select("isSynthesized")
      .eq("message_id", MessageId)
      .single();
    if (lookupError) {
      notifyMe("Lookup error in FinalAnalyzer isSynthesized check", lookupError);
    }
    if (lookupdata?.isSynthesized === true) {
      return res.status(400).json({
        message: "This research thread has already been synthesized.",
      });
    }

    // ── Validate action_type if provided ──
    if (action_type && !["finalize", "continue"].includes(action_type)) {
      return res.status(400).json({ message: "Invalid action_type provided." });
    }

    // ── Helper: finalize a report (returns HTTP response directly) ──
    async function handleFinalize(finalInstructions) {
      const safeInstructions = finalInstructions || "Finalize the report";

      // Cache user message
      const message = {
        id: userMessageId,
        sent_by: "You",
        message: { isComplete: true, content: safeInstructions },
        sent_at: currentTime,
      };
      await CacheCurrentChat(message, req.user);

      const Information = await GetResearchData(MessageId);
      if (!Information || Information.error) {
        return res.status(400).json({
          message: "AI models overloaded. Please try again later.",
        });
      }

      const finalReportSynthesizer = await GenerateResponse(
        `Create a detailed report of this information fetched by you in the previous step of the research.
        The source information also contains the previous original query of the user.
        New/additional instructions from the user: ${safeInstructions}
        Information from sources: ${JSON.stringify(Information.data)}`,
        ANALYST_PROMPT
      );

      if (finalReportSynthesizer?.error || !finalReportSynthesizer?.result) {
        return res.status(400).json({
          message: "AI models overloaded. Please wait a bit before trying again.",
        });
      }

      // Mark as synthesized
      const { error: updationError } = await supabase
        .from("research_data")
        .update({ isSynthesized: true })
        .eq("message_id", MessageId);
      if (updationError) {
        notifyMe("Failed to update isSynthesized in FinalAnalyzer", updationError);
      }

      // Cache AI response
      const AiMessage = {
        id: MessageId,
        sent_by: "AntiNode",
        message: { isComplete: true, content: finalReportSynthesizer.result },
        sent_at: currentTime,
      };
      await CacheCurrentChat(AiMessage, req.user);
      await StoreQueryAndResponse(user.user_id, Information?.data?.query || safeInstructions, finalReportSynthesizer.result, null);
      UpdateReportStatus(MessageId);

      return res.status(200).send({
        message: "Report ready",
        MessageId,
        direct_answer: finalReportSynthesizer.result,
        isSynthesized: true,
      });
    }

    // ── Explicit action_type (now AFTER all validation) ──
    if (action_type === "finalize") {
      return handleFinalize(instructions);
    }

    if (action_type === "continue") {
      // Acknowledge immediately – result will come later via webhook/socket
      res.json({ message: "New thread has been created.", MessageId });
      // Start new research (do not send another HTTP response)
      HandleNewInstructions(
        instructions || "Continue the research",
        {
          user: req.user,
          user_prompt: instructions || "Continue the research",
          plan_type,
          web_search_depth,
          MessageId,
          room_id: null,
        }
      ).catch(err => {
        notifyMe("Continue research error in FinalAnalyzer", err);
      });
      return; // stop execution; client already got the ack
    }

    // ── No explicit action_type → check instruction status & intent ──
    const { isHardcoded, isUnique } = CheckInstructionsStatus(instructions);

    if (isUnique) {
      const identified_intent = await FindIntent(instructions);
      if (!identified_intent || identified_intent.status === false || !identified_intent?.result?.intent) {
        return res.status(400).json({
          message: "Our AI models are overloaded. Could not deduce your intent. Please try again later.",
        });
      }

      const intent = identified_intent.result.intent;

      if (intent === "not_sure") {
        return res.status(400).json({
          message: "Could you be more specific about what you want to do next?",
        });
      }

      if (intent === "finalize_report") {
        return handleFinalize(instructions);
      }

      if (intent === "dig_deeper") {
        // Acknowledge and start new research
        res.json({ message: "New thread has been created.", MessageId });
        HandleNewInstructions(instructions, {
          user: req.user,
          user_prompt: instructions,
          plan_type,
          web_search_depth,
          MessageId,
          room_id: null,
        }).catch(err => {
          notifyMe("Dig deeper research error in FinalAnalyzer", err);
        });
        return;
      }
    }

    if (isHardcoded) {
      // Hardcoded instructions always trigger new research
      res.json({ message: "New thread has been created.", MessageId });
      HandleNewInstructions(instructions, {
        user: req.user,
        user_prompt: instructions,
        plan_type,
        web_search_depth,
        MessageId,
        room_id: null,
      }).catch(err => {
        notifyMe("Hardcoded instruction research error in FinalAnalyzer", err);
      });
      return;
    }

    return res.status(400).json({ message: "Something went wrong while processing your request." });
  } catch (error) {
    console.error("Error in FinalAnalyzer:", error);
    notifyMe("Analyst mode final analyzer error", error);
    return res.status(500).json({ message: "Something went wrong while processing your request!" });
  }
};

// get researchInformation based on specific messageId
import { promisify } from 'util';
import zlib from 'zlib';

const inflate = promisify(zlib.inflate);

export async function GetResearchData(MessageId) {
  const key = `message:${MessageId}:research_report`;

  try {
    // 1. Try compressed cache
    const compressed = await redisClient?.withCommandOptions({ returnBuffers: true }).get(key)
    if (compressed) {
      const json = (await inflate(compressed)).toString();
      const researchData = JSON.parse(json);
      // researchData is the full object: { sources, favicons, details, queries, query?, ... }
      return { error: null, data: [researchData] };  // wrap in array for consistency
    }

    // 2. Fallback to database
    const { data: rows, error } = await supabase
      .from("research_data")
      .select("information, query, isSynthesized, created_at")
      .eq("message_id", MessageId)
      .order("created_at", { ascending: true });

    if (error || !rows || rows.length === 0) {
      return { error: error?.message || "No data found", data: [] };
    }

    // Normalise each row: flatten information to top level, keep query
    const normalized = rows.map(row => ({
      query: row.query,
      sources: row.information?.sources || [],
      favicons: row.information?.favicons || [],
      details: row.information?.details || [],        // the huge array from FormattForLLM
      queries: row.information?.queries || [],
      isSynthesized: row.isSynthesized,
      created_at: row.created_at,
    }));

    // Cache the first normalised object (there is one per message)
    // Compress and store with TTL
    const toCache = normalized[0];      // single object
    const json = JSON.stringify(toCache);
    const compressedBuf = await deflate(json);
    await redisClient.set(key, compressedBuf, 'EX', 60 * 60 * 3); // 3 hours

    return { error: null, data: normalized };
  } catch (err) {
    console.error(`Research Fetch Error: ${err.message}`);
    return { error: "Unable to retrieve research data.", data: [] };
  }
}

// if we are processed new insructions we do it again but with richer context
// export async function HandleNewInstructions(instructions, data) {
//   if (!instructions || typeof instructions !== "string")
//     return { error: "Invalid instructions for the llm", data: null };
//   const { user, user_prompt, plan_type, web_search_depth, MessageId, room_id } =
//     data;
//   const previous_research_data = await GetResearchData(MessageId);
//   if (!previous_research_data || previous_research_data.error) {
//     return { error: "Could not retrieve previous research", data: null };
//   }

//   const sorted_context = {
//     sorted_queries: [],
//     previous_sources: new Set(),
//     search_queries: new Set(),
//   };

//   previous_research_data.data.forEach((elem, index) => {
//     // 1. Capture the User Query
//     if (elem?.query) {
//       // IMPORTANT: Clean the query so we don't pass old "new_instructions" metadata back in
//       const cleanQuery = elem.query
//         .split("&all_previous_user_requests=")[0]
//         .replace("new_instructions", "");
//       sorted_context.sorted_queries.push({
//         order: index,
//         query: cleanQuery.trim(),
//       });
//     }

//     // 2. Extract from Nested Arrays (details/information)
//     const infoArray = elem?.information || elem?.details;
//     if (Array.isArray(infoArray)) {
//       infoArray.forEach((info) => {
//         (info?.sources || []).forEach((src) =>
//           sorted_context.previous_sources.add(src)
//         );
//         (info?.queries || []).forEach((q) =>
//           sorted_context.search_queries.add(q)
//         );
//       });
//     }

//     // 3. Extract from Top-Level (This matches your sample data)
//     (elem?.sources || []).forEach((src) =>
//       sorted_context.previous_sources.add(src)
//     );
//     (elem?.queries || []).forEach((q) => sorted_context.search_queries.add(q));
//   });

//   // converting to array
//   const sourcesArray = Array.from(sorted_context.previous_sources);
//   const queriesArray = Array.from(sorted_context.search_queries);
//   const lastQueryObj =
//     sorted_context.sorted_queries[sorted_context.sorted_queries.length - 1] ||
//     null;

//   const result = HandleOrchestratedResultsHandling({
//     user,
//     question: `## New_Instructions: ${instructions}_${user_prompt}

//   CONTEXT_RESUMPTION:
//   - Previous Requests: ${JSON.stringify(sorted_context.sorted_queries)}
//   - Last Query: ${lastQueryObj?.query || "None"}
//   - Previous Search Queries: ${JSON.stringify(queriesArray)}
//   - Sources Already Explored: ${JSON.stringify(sourcesArray)}`,
//     plan_type,
//     web_search_depth,
//     MessageId,
//     room_id,
//   });

//   if (!result.success) {
//     return {
//       error: "Something went wrong while retrieving the research_archive",
//       data: null,
//     };
//   }

//   // res.json({ message: "New thread has been created." });
//   return {
//     error: null,
//     data: {
//       MessageId: result?.MessageId,
//       status: result.status,
//       stored: result.stored,
//       research_data: result.research_data,
//       success: result.success,
//       direct_answer: result.direct_answer,
//     },
//   };
// }


export async function HandleNewInstructions(instructions, data) {
  if (!instructions || typeof instructions !== "string")
    return { error: "Invalid instructions for the llm", data: null };

  const { user, user_prompt, plan_type, web_search_depth, MessageId, room_id } =
    data;

  const previous_research_data = await GetResearchData(MessageId);
  if (!previous_research_data || previous_research_data.error) {
    return { error: "Could not retrieve previous research", data: null };
  }

  const sorted_context = {
    sorted_queries: [],
    previous_sources: new Set(),
    search_queries: new Set(),
  };

  previous_research_data.data.forEach((elem, index) => {
    // 1. Capture the original user query (cleaned)
    if (elem?.query) {
      const cleanQuery = elem.query
        .split("&all_previous_user_requests=")[0]
        .replace("new_instructions", "");
      sorted_context.sorted_queries.push({
        order: index,
        query: cleanQuery.trim(),
      });
    }

    // 2. Collect top-level sources and search queries
    (elem?.sources || []).forEach((src) =>
      sorted_context.previous_sources.add(src)
    );
    (elem?.queries || []).forEach((q) =>
      sorted_context.search_queries.add(q)
    );
  });

  const sourcesArray = Array.from(sorted_context.previous_sources);
  const queriesArray = Array.from(sorted_context.search_queries);
  const lastQueryObj =
    sorted_context.sorted_queries[sorted_context.sorted_queries.length - 1] || null;

  const result = HandleOrchestratedResultsHandling({
    user,
    question: `## New_Instructions: ${instructions}_${user_prompt}
  
  CONTEXT_RESUMPTION:
  - Previous Requests: ${JSON.stringify(sorted_context.sorted_queries)}
  - Last Query: ${lastQueryObj?.query || "None"}
  - Previous Search Queries: ${JSON.stringify(queriesArray)}
  - Sources Already Explored: ${JSON.stringify(sourcesArray)}`,
    plan_type,
    web_search_depth,
    MessageId,
    room_id,
  });

  if (!result.success) {
    return {
      error: "Something went wrong while retrieving the research_archive",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      MessageId: result?.MessageId,
      status: result.status,
      stored: result.stored,
      research_data: result.research_data,
      success: result.success,
      direct_answer: result.direct_answer,
    },
  };
}