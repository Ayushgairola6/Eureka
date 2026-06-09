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
import {
  DeepScraper,
  FilterUrlForExtraction,
  FormattForLLM,
  ProcessForLLM,
} from "../OnlineSearchHandler/WebCrawler.js";
import { ANALYST_PROMPT, VerificationModePrompt } from "../Prompts/Prompts.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import {
  CheckInstructionsStatus,
  UpdateReportStatus,
} from "./VerificationModeFeatures.js";

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

  const direct_answer = response?.direct_answer;
  return {
    error: null,
    queries: queries || [],
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
      room_id,
    } = data;

    const iterationLimit = web_search_depth === "deep_web" ? 8 : 4;

    if (iteration >= iterationLimit) {
      let mergeResults;

      if (iterationContext.raw_content && iterationContext.raw_content.length > 0) {
        mergeResults = mergeRawResults(iterationContext.raw_content);
      }
      return {
        error: mergeResults ? null : "Iteration limit reached without gathering any important data",
        data: mergeResults,
        MessageId,
        iteration,
        queries: iterationContext?.queries,
        direct_answer: null,
      };
    }

    // Build a lean prompt — only pass previous queries+urls, not raw content
    const contextString = FormatContextForLLM(iterationContext);
    const llmPrompt = `**user_request**:${user_prompt} **context**:${contextString}&iteration_count=${iteration}_max_iteration_limits=${4}`;

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
        direct_answer: null,
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
        direct_answer: null,
      };
    }

    // if the answer was simple
    if (extractedInformation?.direct_answer) return {
      error: null,
      data: null,
      MessageId,
      iteration,
      direct_answer: extractedInformation.direct_answer,
    };
    // console.log(extractedInformation)
    // High confidence — fetch results and return immediately if they exist
    if (extractedInformation?.score >= 0.5 || extractedInformation.queries?.length > 0) {
      const results = await SurfaceWebSearchRequst(extractedInformation.queries, {
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
          direct_answer: null,
        };
      }
      // Results came back empty — track what we tried and retry
      const updatedContext = BuildIterationContext(
        iterationContext,
        extractedInformation.queries,
        results.summaries || [],//the search summary
        results.data
      );

      return WebSearchOrchestrator(iteration + 1, data, updatedContext);
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
async function SurfaceWebSearchRequst(FormattedQueries, data) {
  try {
    const { user, plan_type, MessageId, user_prompt: question, room_id } = data;


    const { response, links: LinksToFetch } = await fetchSearchResults(
      plan_type,
      FormattedQueries?.join(","),
      user,
      MessageId
    );

    // console.log(LinksToFetch, LinksToFetch.slice(0, 4))
    // `user_id` is not defined; use the object passed in
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: `Searching for`,
        data: [
          `Searching the web for following queries ,${JSON.stringify(
            FormattedQueries?.flat()
          )}`,
        ],
      },
    });
    EmitEvent(user?.user_id, "processing_links", {
      MessageId,
      status: { message: "I am gonna read these sources", data: LinksToFetch },
    });
    if (!response || LinksToFetch?.length === 0) {
      return {
        error: "There were so results found on the web for your request",
        data: null,
      };
    }

    const CleanedWebData = await ProcessForLLM(
      LinksToFetch.slice(0, 5),
      user,
      question,
      MessageId,
      room_id,
      plan_type
    );
    console.log(CleanedWebData, 'cleaned-web-data')
    if (CleanedWebData.length === 0) {
      return { error: "The processedInformation was not enough", data: null };
    }



    const FormattedResearchData = FormattForLLM(CleanedWebData);
    console.log(FormattedResearchData, 'formattedReseachdata')
    if (FormattedResearchData.error) {
      return { error: "The processedInformation was not enough", data: null };
    }

    const summaries = [];
    for (const item of FormattedResearchData.FinalContent) {
      if (item.content) {
        const current_summary = await Summarize(item?.markdown);
        summaries.push({
          source: item.url, content_summary: current_summary
        })
      }
    }
    console.log(summaries, 'summaries');
    return { error: null, data: FormattedResearchData, summaries: summaries };
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
    // if (plan_type === "free" || plan_type === "sprint pass") {
    //   return res.status(403).json({
    //     message:
    //       "This plan does not include analyst mode, if you want to try it please considering upgrading your plan.",
    //   });
    // }
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
      direct_answer: result?.direct_answer,
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
      return res
        .status(401)
        .send({ message: "Please login to contiue the session" });

    const {
      instructions,
      MessageId, //the uniuqe LLM response Id
      userMessageId, // the user_mesage-id
      web_search_depth,
      action_type,
    } = req.body;
    if (
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
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user.user_id
    );

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

    // free & sprint pass not allowed
    // if (plan_type === "free" || plan_type === "sprint pass") {
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

    // check if this has been already synthesized
    const { data: lookupdata, error: lookupError } = await supabase
      .from("research_data")
      .select("isSynthesized")
      .eq("message_id", MessageId)
      .single();
    if (lookupError) {
      notifyMe(
        "An error occured while looking up for a report for analyst mode isSYnthesized status in finalanalyzer (line:667)",
        lookupError
      );
    }

    if (lookupdata?.isSynthesized === true) {
      return res.status(400).json({
        message:
          "This research thread has been already synthesized based on your previous instructions.",
      });
    }
    // if the user explicitly asked to finalize the report
    console.log("action-type", action_type)
    if (action_type && action_type === "finalize") {
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
      const finalReportSynthesizer = await GenerateResponse(
        `Create a detailed report of this information fetched by you in the previous step of the research \n,the source information also contains the previous original query of the user so also keep that into consideration\n,
        these are new and additional instructions from the ##user=${instructions}\n,
        this is the information from ## sources=${JSON.stringify(
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
        instructions,
        finalReportSynthesizer.result,
        null
      );

      UpdateReportStatus(MessageId);
      return res.status(200).send({
        message: "Report ready",
        direct_answer: finalReportSynthesizer.result,
        isSynthesized: true,
      });
    } else if (action_type === "continue") {
      const newResearchResults = await HandleNewInstructions(
        instructions ||
        "No instructions were provided but the user has asked to continue the research",
        {
          user: req.user,
          user_prompt:
            "No instructions were provided but the user has asked to continue the research",
          plan_type,
          web_search_depth,
          MessageId,
          room_id: null,
        }
      );

      return res
        .status(newResearchResults.data.status === "partial" ? 206 : 200)
        .json({
          message: "Research done",
          MessageId: newResearchResults.data.MessageId,
          research_data: newResearchResults.data.research_data,
          status: newResearchResults.data.status,
        });
    }
    // validate the type of instruction
    const { isHardcoded, isUnique } = CheckInstructionsStatus(instructions);

    console.log(isHardcoded, isUnique, 'intent recogniztion')
    // if the instructions are unique
    if (isUnique === true) {
      const identified_intent = await FindIntent(instructions); //identify the user intent
      if (
        !identified_intent ||
        identified_intent.status === false ||
        !identified_intent?.result?.intent
      ) {
        return res.status(400).json({
          message:
            "Our AI models are overloaded right now so it was not able to deduce your intent, please try again later.",
        });
      }
      const intent = identified_intent?.result?.intent || "finalize_report";

      if (intent === "not_sure")
        return res.status(400).json({
          message:
            "Could be more specific about what do you want do proceed with next",
        });

      if (intent === "dig_deeper") {
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
      } else if (intent === "finalize_report") {
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
        const finalReportSynthesizer = await GenerateResponse(
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
          instructions,
          finalReportSynthesizer.result,
          null
        );
        UpdateReportStatus(MessageId); //update the report status

        return res.status(200).send({
          message: "Report ready",
          direct_answer: finalReportSynthesizer.result,
          isSynthesized: true,
        });
      }
    } else if (isHardcoded === true) {
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

    return res
      .status(400)
      .json({ message: "Something went wrong while processing your request" });
    // cache the user message
  } catch (error) {
    console.error("Error in the final analyzer handler \n", error);
    notifyMe("Analyst mode final analyzer error\n", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while processing your request!" });
  }
};

// get researchInformation based on specific messageId
export async function GetResearchData(MessageId) {
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
      .select("information,query,isSynthesized,created_at")
      .eq("message_id", MessageId)
      .order("created_at", { ascending: true });

    if (error) {
      return { error: "No data found in the db", data: [] };
    }

    // If data exists in DB but wasn't in Redis, push it to Redis for next time
    if (data && data.length > 0) {
      const stringifiedData = data.map((item) => JSON.stringify(item));
      await redisClient
        .multi()
        .rPush(key, stringifiedData)
        .expire(key, 60 * 60 * 3) ///for three hours for fresh researches
        .exec();
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
    // 1. Capture the User Query
    if (elem?.query) {
      // IMPORTANT: Clean the query so we don't pass old "new_instructions" metadata back in
      const cleanQuery = elem.query
        .split("&all_previous_user_requests=")[0]
        .replace("new_instructions", "");
      sorted_context.sorted_queries.push({
        order: index,
        query: cleanQuery.trim(),
      });
    }

    // 2. Extract from Nested Arrays (details/information)
    const infoArray = elem?.information || elem?.details;
    if (Array.isArray(infoArray)) {
      infoArray.forEach((info) => {
        (info?.sources || []).forEach((src) =>
          sorted_context.previous_sources.add(src)
        );
        (info?.queries || []).forEach((q) =>
          sorted_context.search_queries.add(q)
        );
      });
    }

    // 3. Extract from Top-Level (This matches your sample data)
    (elem?.sources || []).forEach((src) =>
      sorted_context.previous_sources.add(src)
    );
    (elem?.queries || []).forEach((q) => sorted_context.search_queries.add(q));
  });

  // converting to array
  const sourcesArray = Array.from(sorted_context.previous_sources);
  const queriesArray = Array.from(sorted_context.search_queries);
  const lastQueryObj =
    sorted_context.sorted_queries[sorted_context.sorted_queries.length - 1] ||
    null;

  const result = await HandleOrchestratedResultsHandling({
    user,
    question: `new_instructions: ${instructions}${user_prompt}
  
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
