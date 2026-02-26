import {
  FormalSerpAPIresults,
  GetDataFromSerpApi,
} from "../OnlineSearchHandler/serpapi_handler.js";
import { ProcessForLLM } from "../OnlineSearchHandler/WebCrawler.js";
import { WEB_SEARCH_DISTRIBUTOR_PROMPT } from "../Prompts/Prompts.js";
import { GetChatsForContext } from "../Synthesis/phase2_action.js";
import { ToolRegistry } from "../Synthesis/tools.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { GenerateResponse } from "./ModelController.js";
import { supabase } from "./supabaseHandler.js";

// parse the llm response
export const ExtractJSON = (response) => {
  try {
    if (!response || typeof response !== "string") {
      return { error: "Invalid response type" };
    }

    // Strip markdown code blocks if present
    const cleaned = response
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    // Find JSON object boundaries
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return { error: "No JSON object found in response" };
    }

    const jsonString = cleaned.slice(start, end + 1);
    const parsed = JSON.parse(jsonString);

    return parsed;
  } catch (error) {
    console.error("JSON extraction failed:", error.message);
    return { error: "Failed to parse JSON", raw: response };
  }
};

// Function 2: Execute tools from parsed response — yours to write
export const ExecuteTools = async (toolsRequired, context) => {
  if (!toolsRequired) {
    return { error: "The tools called by ", message: null, results: [] };
  }
  const { user, MessageId, modelResponse, room_id } = context;
  if (!user) {
    return { error: "Context is missing data", message: null, results: [] };
  }
  const ParsedResults = ExtractJSON(modelResponse);

  console.log(
    "The models parsed and plain response\n",
    modelResponse,
    ParsedResults
  );
  if (!ParsedResults) {
    return { error: "Context is missing data", message: null, results: [] };
  }

  //   {
  //   "response": "Your answer. Professional tone, no hallucinations. Cite sources inline as [Title — date]. Never truncate.",
  //   "tools_required": [{"tool_name": "tool_name_here", "argument": "argument_here"}],
  //   "thought": "Brief reasoning — why you chose these tools or answered directly"
  // }
  // emit thoughts
  const thoughts = toolsRequired?.thought;
  if (thoughts) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "new_thread",
        data: [thoughts],
      },
    });
  }

  const tools_required = toolsRequired?.tools_required;

  if (tools_required && tools_required.length === 0) {
    return { message: toolsRequired.response, error: null, results: [] };
  }

  if (tools_required.length === 0) {
    return {
      error: "The llm did not ask for any tools",
      message: null,
      results: [],
    };
  }
  EmitEvent(user.user_id, "query_status", {
    MessageId,
    status: {
      message: "Creating functions",
      data: tools_required,
    },
  });
  const contextResults = await OrchrestrateTools(toolsRequired, {
    user,
    room_id,
    MessageId,
  });

  if (!contextResults) {
    return {
      error: "The context results are not present",
      message: null,
      results: [],
    };
  }

  return {
    error: null,
    message: "context fetched from tools",
    results: contextResults,
  };
};

//function to find and execute tools

async function OrchrestrateTools(toolsArray, data) {
  const results = { web_search_results: [], session_chat: [], memories: [] };

  const webSearch = toolsArray.filter(
    (tool) => tool?.tool_name?.toLowerCase() === "web_search"
  );

  const { user, room_id, MessageId } = data;
  // if there are requests for web search
  if (webSearch?.length > 0) {
    const searchPromises = webSearch
      .filter((request) => request?.query) // 1. Only process valid requests
      .map((request) =>
        GetDataFromSerpApi(request.query, user, room_id, MessageId).catch(
          (error) => {
            console.error(`Search failed for ${request.query}:`, error);
            return null; // 2. Fail gracefully per-request
          }
        )
      );

    // 3. Wait for all valid requests to resolve
    const webResults = (await Promise.all(searchPromises)).filter(Boolean);

    if (webResults.length > 0) {
      const LinksToScrape = [];
      webResults.forEach((res) => {
        if (res) {
          const links = FormalSerpAPIresults(response);
          if (links && links?.length > 0) {
            LinksToScrape.push(links.flat()); //insert the links in the scraper
          }
        }
      });

      // if there any links for us to scrape
      if (LinksToScrape.length > 0) {
        const WebResults = await ProcessForLLM(
          LinksToScrape,
          user,
          user_prompt,
          MessageId,
          room_id,
          plan_type
        );

        if (
          !WebResults ||
          WebResults?.error ||
          WebResults?.FinalContent?.length === 0
        ) {
          results?.web_search_results.push(
            "An error occured while searching the web but we did find this data from web-crawler:",
            webResults
          );
        } else {
          results?.web_search_results.push(webResults);
        }
      }
    }
  }

  //   store a memory
  const StoreMemory = toolsArray.filter(
    (tool) => tool?.tool_name?.toLowerCase() === "store_memory"
  );
  if (StoreMemory?.length > 0) {
    const searchPromises = StoreMemory.filter(
      (request) => request?.memory_type && request?.memory_value
    ) // 1. Only process valid requests
      .map((request) =>
        supabase
          .from("memories")
          .upsert({
            memory_type: request?.memory_type,
            memory_value: request.memory_value || "unknon",
          })
          .eq("user_id", user.user_id)
          .catch((error) => {
            console.error(
              `Search failed for ${
                (request?.memory_type, request?.memory_value)
              }:`,
              error
            );
            return null; // 2. Fail gracefully per-request
          })
      );

    // 3. Wait for all valid requests to resolve
    (await Promise.all(searchPromises)).filter(Boolean);
    console.log("Stored some memories");
  }

  //   get users memories
  const getMemory = toolsArray.filter(
    (tool) => tool?.tool_name?.toLowerCase() === "get_memory"
  );

  if (getMemory?.length > 0) {
    const getPromises = getMemory
      .filter((request) => request)
      .map((request) =>
        supabase
          .from("memories")
          .select("*")
          .eq("user_id", user.user_id)
          .catch((error) => {
            console.error(`Search failed for ${request}:`, error);
            return null; // 2. Fail gracefully per-request
          })
      );

    const memories = (await Promise.all(getPromises)).filter(Boolean);
    results?.memories?.push(memories);
    console.log("getting some memories");
  }

  //get session chat history

  const GetSessionChat = toolsArray.filter(
    (tool) => tool?.tool_name?.toLowerCase() === "get_session_chat"
  );

  if (GetSessionChat?.length > 0) {
    const pastConversation = await GetChatsForContext(req.user);
    if (!pastConversation || pastConversation.length === 0) {
      results.session_chat.push(`Failed to get session chat history`);
    } else {
      results.session_chat = [...pastConversation];
    }
  }

  return results;
}

// recursive tools executioner only condition based
const MAX_AGENT_LOOPS = 3;
export async function WebSerchAgentLoop(
  history,
  question,
  user,
  plan_type,
  room_id,
  context,
  currentIteration = 0,
  MessageId
) {
  console.log(
    "this is the current loop count, context we have and model response",
    `\n`,
    currentIteration,
    `\n`,
    context,
    `\n`,
    question
  );
  if (currentIteration >= MAX_AGENT_LOOPS) {
    const FinalAnswer = await GenerateResponse(
      `userQuery=${question}`,
      JSON.stringify(context),
      WEB_SEARCH_DISTRIBUTOR_PROMPT,
      user,
      plan_type
    );
    return { error: null, message: FinalAnswer, results: context };
  }
  const Answer = await GenerateResponse(
    `userQuery=${question}&previous-chats=${JSON.stringify(history)}`,
    JSON.stringify(context),
    WEB_SEARCH_DISTRIBUTOR_PROMPT,
    user,
    plan_type
  );

  if (!Answer || Answer?.error) {
    return {
      error:
        "Our AI models are overloaded right now please wait a bit while, in the meantime you can try out the sysnthesis mode or wait till we fix this issue.",
      message: null,
      results: { web_search_results: [], session_chat: [], memories: [] },
    };
  }

  // handle llm response orchrestration
  const ModelReport = await ExecuteTools(Answer, {
    user,
    MessageId,
    Answer,
    room_id,
  });

  if (!ModelReport || ModelReport?.error) {
    console.error(ModelReport?.error);
    notifyMe(
      "The llm orcreshtration in post type web search sent an error\n",
      ModelReport?.error
    );
    return {
      error:
        "Our AI models are overloaded right now please wait a bit while, in the meantime you can try out the sysnthesis mode or wait till we fix this issue.",
      message: null,
      results: { web_search_results: [], session_chat: [], memories: [] },
    };
  }

  // if llm just generated a response
  if (ModelReport?.message) {
    if (ModelReport?.message) {
      return { error: null, message: ModelReport.message, results: context };
    }
  }
  await new Promise((res) => setTimeout(res, 5000));
  return WebSerchAgentLoop(
    history,
    `user-query=${question}&your-previous-request=${Answer}`,
    user,
    plan_type,
    room_id,
    ModelReport?.results || ["No context from the previously called tools"],
    currentIteration + 1,
    MessageId
  );
}
