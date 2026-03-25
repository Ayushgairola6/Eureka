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
  HandleInference,
  StructuredOutPutInferenceHandler,
} from "../controllers/GroqInferenceController.js";
import { FilterIntent } from "../controllers/ModelController.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import {
  FilterUrlForExtraction,
  FormattForLLM,
  ProcessForLLM,
} from "../OnlineSearchHandler/WebCrawler.js";
import {
  ANALYST_PROMPT,
  IntentIdentifier,
  VerificationModePrompt,
} from "../Prompts/Prompts.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";

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
        message: "new_thread",
        data: [thought],
      },
    });
  }

  const queries = response?.queries;

  const confidence_score = response?.confidence_score;

  return { error: null, queries: queries || [], score: confidence_score || 0 };
}
// recursive web search orchestration
// Lightweight context tracker — only queries + URLs, no raw content
function BuildIterationContext(previousContext, newQueries, newUrls) {
  return {
    queries: [...(previousContext?.queries || []), ...newQueries],
    urls: [...(previousContext?.urls || []), ...newUrls],
  };
}

// Formats context into a compact LLM-safe string (minimal tokens)
function FormatContextForLLM(iterationContext) {
  if (!iterationContext?.queries?.length) return "";
  return `previous_queries=${JSON.stringify(
    iterationContext.queries
  )}&scraped_urls=${JSON.stringify(iterationContext.urls)}`;
}

async function WebSearchOrchestrator(
  iteration = 0,
  data,
  iterationContext = { queries: [], urls: [] }
) {
  try {
    const {
      user,
      user_prompt,
      plan_type,
      web_search_depth,
      MessageId,
      room_id,
    } = data;

    const iterationLimit = web_search_depth === "deep_web" ? 5 : 2;

    // Hard stop — no recursion, no string stuffing, just bail
    if (iteration >= iterationLimit) {
      return {
        error: "Iteration limit reached without sufficient results",
        data: null,
        MessageId,
        iteration,
        queries: iterationContext?.queries,
      };
    }

    // Build a lean prompt — only pass previous queries+urls, not raw content
    const contextString = FormatContextForLLM(iterationContext);
    const llmPrompt = `user_request=${user_prompt}&plan_type=${plan_type}${
      contextString ? `&${contextString}` : ""
    }`;

    const IdentifiedRequests = await StructuredOutPutInferenceHandler(
      llmPrompt,
      VerificationModePrompt
    );

    if (
      !IdentifiedRequests ||
      IdentifiedRequests?.error ||
      !IdentifiedRequests.result
    ) {
      return {
        error: "Failed to generate a response",
        data: null,
        MessageId,
        iteration,
        queries: iterationContext.queries,
      };
    }

    const extractedInformation = ExtractFields(IdentifiedRequests.result, {
      user,
      MessageId,
    });

    if (extractedInformation.error) {
      notifyMe("Orchestrator crashed\n", extractedInformation?.error);
      return {
        error: extractedInformation.error,
        data: null,
        MessageId,
        iteration,
      };
    }

    // High confidence — fetch results and return immediately if they exist
    if (extractedInformation?.score >= 0.5) {
      const results =
        web_search_depth === "deep_web"
          ? await DeepSearchRequest(extractedInformation.queries, {
              user,
              user_prompt,
              MessageId,
              room_id,
              plan_type,
            })
          : await SurfaceWebSearchRequst(extractedInformation.queries, {
              user,
              plan_type,
              MessageId,
              user_prompt,
              room_id,
            });

      if (results && !results.error && results.data) {
        return {
          error: null,
          data: results,
          MessageId,
          iteration,
          queries: extractedInformation.queries,
        };
      }

      // Results came back empty — track what we tried and retry
      const updatedContext = BuildIterationContext(
        iterationContext,
        extractedInformation.queries,
        results?.data?.data?.urls || []
      );

      return WebSearchOrchestrator(iteration + 1, data, updatedContext);
    }

    // Low confidence — track queries tried, ask LLM to be more specific next round
    const updatedContext = BuildIterationContext(
      iterationContext,
      extractedInformation.queries,
      [] // no URLs since we didn't search yet
    );

    return WebSearchOrchestrator(iteration + 1, data, updatedContext);
  } catch (error) {
    notifyMe("Analyst mode orchestration error\n crashed", error);
    return {
      error: "Failed to find any results",
      data: null,
      MessageId,
      iteration,
      queries: [],
    };
  }
}

//helper function for deep-search request
async function DeepSearchRequest(FormattedQueries, data) {
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
      return { error: "No links found for your search results", data: null };
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
async function SurfaceWebSearchRequst(FormattedQueries, data) {
  try {
    const { user, plan_type, MessageId, user_prompt: question, room_id } = data;
    const { response, links: LinksToFetch } = await fetchSearchResults(
      plan_type,
      FormattedQueries?.join(","),
      user,
      MessageId
    );

    // `user_id` is not defined; use the object passed in
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: `Searching for`,
        data: [
          `Crawling deep web for following queries ,${JSON.stringify(
            FormattedQueries?.flat()
          )}`,
        ],
      },
    });
    if (!response || LinksToFetch?.length === 0) {
      return {
        error: "There were so results found on the web for your request",
        data: null,
      };
    }
    const CleanedWebData = await ProcessForLLM(
      LinksToFetch,
      user,
      question,
      MessageId,
      room_id,
      plan_type
    );

    if (CleanedWebData.length === 0) {
      return { error: "The processedInformation was not enough", data: null };
    }

    const FormattedResearchData = FormattForLLM(CleanedWebData);

    if (FormattedResearchData.error) {
      return { error: "The processedInformation was not enough", data: null };
    }

    return { error: null, data: FormattedResearchData };
  } catch (error) {
    return { error, data: null };
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
    if (plan_type === "free" || plan_type === "sprint pass") {
      return res.status(403).json({
        message:
          "This plan does not include analyst mode, if you want to try it please considering upgrading your plan.",
      });
    }
    // orchestrate results
    const result = await HandleOrchestratedResultsHandling({
      user: req.user,
      question: question,
      plan_type: plan_type,
      web_search_depth: web_search_depth,
      MessageId: MessageId,
      room_id: null,
    });

    if (!result.success) {
      return res
        .status(400)
        .json({ message: "An error occured while continuing the research!" });
    }

    return res.status(result.status === "partial" ? 206 : 200).json({
      message: "Research done",
      MessageId: result.MessageId,
      research_data: result.research_data,
      status: result.status,
    });
  } catch (error) {
    console.error("Verification search error\n", error);
    return res
      .status(500)
      .json({ message: "An error occured while processing your results." });
  }
};

// cache and store the research_data for final
async function StoreResearchData(research_data, data) {
  try {
    const { MessageId, web_search_depth, user, question } = data;

    if (!research_data || !MessageId)
      return { error: "Invalid or missing parmaters." };
    const key = `message:${MessageId}:research_report`;
    try {
      const cacheExpiryTime = 60 * 60 * 1; //store for 3 hours
      await redisClient
        .multi()
        .rPush(key, JSON.stringify(research_data))
        .expire(key, cacheExpiryTime, "NX")
        .exec();
    } catch (redisCacheError) {
      notifyMe(
        "An erro occured while caching results of a research report\n",
        redisCacheError
      );
    }

    const { error: dbInsertionError } = await supabase
      .from("research_data")
      .insert({
        user_id: user?.user_id,
        message_id: MessageId,
        query: question,
        information: {
          sources: research_data.sources,
          favicons: research_data.favicons,
          details: research_data.details,
          queries: research_data.queries,
        },
        sources_count: research_data.sources.length,
        depth: web_search_depth,
        isSynthesized: false,
      });

    if (dbInsertionError) {
      notifyMe(
        "There was an error while inserting the research data in the database\n",
        dbInsertionError
      );
    }
    return { error: null };
  } catch (storageError) {
    return { error: storageError };
  }
}

// resurable function to handle orchestrated results
async function HandleOrchestratedResultsHandling(data) {
  const { user, question, plan_type, web_search_depth, MessageId, room_id } =
    data;

  const OrchesTratedResults = await WebSearchOrchestrator(0, {
    user,
    user_prompt: question,
    context: "no context",
    plan_type,
    web_search_depth,
    MessageId,
    room_id: null,
  });

  // ── Total failure — nothing to salvage ──────────────────────────────────
  if (OrchesTratedResults?.error && OrchesTratedResults?.iteration === 0) {
    return {
      success: false,
      status: "failed",
      research_data: null,
      MessageId,
      error: OrchesTratedResults.error,
      queries: [],
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
  };
}
// final analysis handler when user either wants to synthesize the report or add more instructions
export const FinalAnalyzer = async (req, res) => {
  try {
    const user = req?.user;

    if (!user)
      return res
        .status(401)
        .send({ message: "Please login to contiue the session" });

    const {
      instructions,
      user_choice,
      MessageId,
      userMessageId,
      report,
      web_search_depth,
    } = req.body;
    if (
      !user_choice ||
      typeof user_choice !== "string" ||
      !MessageId ||
      typeof MessageId !== "string" ||
      !userMessageId ||
      typeof userMessageId !== "string"
    )
      return res.status(400).json({
        message:
          "Please choose either you want to proceed further with this researched data, reject it or finalize this for a detailed report.",
      });

    // if there are further instructions for the user
    const { status, error, plan_type, plan_status, decision_type } =
      await CheckUserPlanStatus(user.user_id);

    //if the user is not paid or the paid staus is not even available
    if (status === false || error || !plan_type) {
      return res.status(400).send({
        message:
          "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
      });
    }

    // check if this has been already synthesized
    const { data, error: lookupError } = await supabase
      .from("research_data")
      .select("isSynthesized")
      .eq("message_id", MessageId)
      .single();
    if (lookupError || !data) {
      return res
        .status(400)
        .json({ message: "There was an error while tracking your request" });
    }

    // ── Report / flag path ────────────────────────────────────────────────
    if (report) {
      const { error: reportError } = await supabase
        .from("reported_message")
        .insert({ report_value: report, message_id: MessageId });

      if (reportError) {
        notifyMe("Error storing research report flag", reportError);
      }

      return res.status(201).json({
        message: "Thanks for the report, this helps us improve our services.",
      });
    }

    /// free and sprint pass users aren't eligible for this
    if (instructions && decision_type != "finalize") {
      if (plan_type === "free" || plan_type === "sprint pass") {
        return res.status(400).json({
          message:
            "Planner and Architect members can give further instructions for deeper research.",
        });
      }

      // retry the orchestration for more richer results
      const newResearchResults = await HandleNewInstructions(instructions, {
        user: req.user,
        user_prompt: instructions,
        plan_type,
        web_search_depth,
        MessageId,
        room_id: null,
      });

      return res
        .status(newResearchResults.data.status === "partial" ? 206 : 200)
        .json({
          message: "Research done",
          MessageId: newResearchResults.data.MessageId,
          research_data: newResearchResults.data.research_data,
          status: newResearchResults.data.status,
        });
    }

    // instruction but with finalize report
    if (instructions && decision_type === "finalize") {
      // cache the user message
      const message = {
        id: userMessageId, //users message Id
        sent_by: "You", //sent by the user
        message: { isComplete: true, content: instructions },
        sent_at: currentTime,
      };
      await CacheCurrentChat(message, req.user);
      const Information = await GetResearchData(MessageId);
      // create a report
      if (!Information || Information.error) {
        return res.status(400).json({
          message:
            "Seems like our AI models are overloaded right now please stand by while we try to fix this problem, you can continue this research from your archive.",
        });
      }
      const finalReportSynthesizer = await HandleInference(
        `Create a detailed report of this information fetched by you in the previous step of the research \n,the source information also contains the previous original query of the user so also keep that into consideration\n,
        these are new and additional instructions from the user=${instructions}\n,this is the information from sources=${JSON.stringify(
          Information.data
        )}`,
        ANALYST_PROMPT
      );

      if (finalReportSynthesizer?.error || !finalReportSynthesizer?.result) {
        return res.status(400).json({
          message:
            "Our AI models are very overloaded right now please wait a bit before trying again later.",
        });
      }
      const { error: updationError } = await supabase
        .from("research_data")
        .update({ isSynthesized: true })
        .eq("message_id", MessageId); //update the synthesis value

      if (updationError) {
        notifyMe(
          "There was an error while trying to update the isSynthesized value for analyst mode",
          JSON.stringify(updationError)
        );
      }

      const AiMessage = {
        id: MessageId,
        sent_by: "AntiNode", //sent by the user
        message: {
          isComplete: true,
          content: finalReportSynthesizer.result,
        },
        sent_at: currentTime,
      };
      // update the cache
      await CacheCurrentChat(AiMessage, req.user);
      await StoreQueryAndResponse(
        user.user_id,
        user_choice,
        finalReportSynthesizer.result,
        null
      );

      return res.status(200).send({
        message: "Report ready",
        result: finalReportSynthesizer.result,
        isSynthesized: true,
      });
    }
    //  final report path
    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: instructions },
      sent_at: currentTime,
    };
    await CacheCurrentChat(message, req.user);

    const Information = await GetResearchData(MessageId);
    // create a report
    if (!Information || Information.error) {
      return res.status(400).json({
        message:
          "Seems like our AI models are overloaded right now please stand by while we try to fix this problem, you can continue this research from your archive.",
      });
    }
    const finalReportSynthesizer = await HandleInference(
      `Analyze and create a report of this information based of  the sources and the previous instructions and queries used to fetch the results =${JSON.stringify(
        Information.data
      )} `,
      ANALYST_PROMPT
    );

    if (finalReportSynthesizer?.error || !finalReportSynthesizer?.result) {
      return res.status(400).json({
        message:
          "Our AI models are very overloaded right now please wait a bit before trying again later.",
      });
    }
    const { error: updationError } = await supabase
      .from("research_data")
      .update({ isSynthesized: true })
      .eq("message_id", MessageId); //update the synthesis value

    if (updationError) {
      notifyMe(
        "There was an error while trying to update the isSynthesized value for analyst mode",
        JSON.stringify(updationError)
      );
    }

    const AiMessage = {
      id: MessageId,
      sent_by: "AntiNode", //sent by the user
      message: {
        isComplete: true,
        content: finalReportSynthesizer.result,
      },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(AiMessage, req.user);
    await StoreQueryAndResponse(
      user.user_id,
      user_choice,
      finalReportSynthesizer.result,
      null
    );

    return res.status(200).send({
      message: "Report ready",
      result: finalReportSynthesizer.result,
      isSynthesized: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong while processing your request!" });
  }
};

// get researchInformation based on specific messageId
async function GetResearchData(MessageId) {
  const key = `message:${MessageId}:research_report`; // Using colons is standard Redis convention

  try {
    const cachedResults = await redisClient.lRange(key, 0, -1);

    if (cachedResults && cachedResults.length > 0) {
      const parsedData = cachedResults.map((content) => JSON.parse(content));
      return { error: null, data: parsedData };
    }

    // no cache get from db
    const { data, error } = await supabase
      .from("research_data")
      .select("details,query,isSynthesized")
      .eq("message_id", MessageId);

    if (error) {
      return { error: "No data found in the db", data: [] };
    }

    // If data exists in DB but wasn't in Redis, push it to Redis for next time
    if (data && data.length > 0) {
      const stringifiedData = data.map((item) => JSON.stringify(item));
      await redisClient.rPush(key, stringifiedData);
      await redisClient.expire(key, 60 * 60 * 3); // for 3 hours
    }

    return { error: null, data: data };
  } catch (err) {
    console.error(`Research Fetch Error: ${err.message}`);
    return {
      error: "Unable to retrieve research data.",
      data: [],
    };
  }
}

// if we are processed new insructions we do it again but with richer context
async function HandleNewInstructions(instructions, data) {
  if (!instructions || typeof instructions !== "string")
    return { error: "Invalid instructions for the llm", data: null };

  const { user, user_prompt, plan_type, web_search_depth, MessageId, room_id } =
    data;

  const previous_research_data = await GetResearchData(MessageId);

  if (!previous_research_data || previous_research_data?.error) {
    return {
      error: "Something went wrong while retrieving the research_archive",
      data: null,
    };
  }
  const previousQueries = previous_research_data.data[0]?.details?.queries;
  const previousPrompt = previous_research_data?.data[0]?.query;
  const urls = previous_research_data?.data[0].details?.sources;

  const result = await HandleOrchestratedResultsHandling({
    user,
    question: `new_instructions${instructions}&previous_user_request=${previousPrompt}&previous_search_queries_generated_by_you=${JSON.stringify(
      previousQueries
    )}&previous_sources_scraped=${JSON.stringify(urls)}`,
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
    },
  };
}
