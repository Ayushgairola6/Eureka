import {
  FormalSerpAPIresults,
  GetDataFromSerpApi,
} from "../OnlineSearchHandler/serpapi_handler.js";
import { ProcessForLLM } from "../OnlineSearchHandler/WebCrawler.js";
import { WEB_SEARCH_DISTRIBUTOR_PROMPT } from "../Prompts/Prompts.js";
import { safeJsonParse } from "../Synthesis/Identifier.js";
import { GetChatsForContext } from "../Synthesis/phase2_action.js";
import { ToolRegistry } from "../Synthesis/tools.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { HandleInference } from "./GroqInferenceController.js";
import { GenerateResponse } from "./ModelController.js";
import { supabase } from "./supabaseHandler.js";

// parse the llm response
function ExtractJSON(rawResponse) {
  if (!rawResponse || typeof rawResponse !== "string") return null;

  const cleanString = rawResponse.trim();

  // All extraction strategies, tried in order of confidence
  const strategies = [
    () => tryExtractFromCodeBlock(cleanString),
    () => tryExtractJsonObject(cleanString),
    () => tryExtractJsonArray(cleanString),
    () => tryParseRepaired(cleanString),
  ];

  for (const strategy of strategies) {
    const result = strategy();
    if (result !== null) return result;
  }

  console.error(
    "All extraction strategies failed. Raw string was:",
    rawResponse
  );
  return null;
}

function tryParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Strategy 1: Extract from ```json ... ``` or ``` ... ``` blocks
function tryExtractFromCodeBlock(str) {
  const codeBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/gi;
  let match;
  while ((match = codeBlockRegex.exec(str)) !== null) {
    const candidate = match[1].trim();
    const parsed = tryParse(candidate);
    if (parsed !== null) return parsed;
  }
  return null;
}

// Strategy 2: Find the outermost JSON object {}
// Walks char-by-char to correctly handle nested braces
function tryExtractJsonObject(str) {
  return extractByBrackets(str, "{", "}");
}

// Strategy 3: Find the outermost JSON array []
function tryExtractJsonArray(str) {
  return extractByBrackets(str, "[", "]");
}

// Scans the string for ALL occurrences of a valid JSON structure
// defined by an open/close bracket pair, returns the first valid one
function extractByBrackets(str, openChar, closeChar) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== openChar) continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = i; j < str.length; j++) {
      const char = str[j];

      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\" && inString) {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === openChar) depth++;
      else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          const candidate = str.substring(i, j + 1);
          const parsed = tryParse(candidate);
          if (parsed !== null) return parsed;
          break; // This start index failed, try the next one
        }
      }
    }
  }
  return null;
}

// Strategy 4: Last resort — attempt common syntax repairs on the whole string
function tryParseRepaired(str) {
  let repaired = str;

  // Remove any leading/trailing non-JSON text if braces/brackets exist
  const firstBrace = str.search(/[{[]/);
  const lastBrace = str.search(/[}\]]/);
  if (firstBrace !== -1 && lastBrace !== -1) {
    repaired = str.substring(firstBrace, lastBrace + 1);
  }

  // Fix trailing commas: [1, 2,] or {a: 1,}
  repaired = repaired.replace(/,\s*([\]}])/g, "$1");

  // Fix unquoted keys: {name: "value"} → {"name": "value"}
  repaired = repaired.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '$1"$2":'
  );

  return tryParse(repaired);
}
// Function 2: Execute tools from parsed response — yours to write
export const ExecuteTools = async (toolsRequired, context) => {
  if (!toolsRequired) {
    return { error: "The tools called by ", message: null, results: [] };
  }
  const { user, MessageId, modelResponse, room_id } = context;
  if (!user) {
    return { error: "Context is missing data", message: null, results: [] };
  }
  const ParsedResults = safeJsonParse(modelResponse);

  console.log(
    "The models parsed and plain response\n",
    modelResponse,
    ParsedResults
  );
  if (!ParsedResults) {
    return { error: "Context is missing data", message: null, results: [] };
  }

  const thoughts = toolsRequired?.thought;
  if (thoughts) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "new_thread",
        data: [thoughts || "No thinking required"],
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
    // const FinalAnswer = await GenerateResponse(
    //   `userQuery=${question}`,
    //   JSON.stringify(context),
    //   WEB_SEARCH_DISTRIBUTOR_PROMPT,
    //   user,
    //   plan_type
    // );
    const FinalAnswer = await HandleInference(
      `user_prompt=${question}&context=${context}`,
      WEB_SEARCH_DISTRIBUTOR_PROMPT
    );

    const FinalReport = await ExecuteTools(FinalAnswer?.result, {
      user,
      MessageId,
      Answer: FinalAnswer?.result,
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
    return {
      error: null,
      message: FinalReport?.message,
      results: FinalReport?.results,
    };
  }
  const Answer = await HandleInference(
    `user_prompt${question}&context=${context}`,
    WEB_SEARCH_DISTRIBUTOR_PROMPT
  );
  console.log(Answer);

  if (!Answer || Answer?.error || !Answer?.result) {
    return {
      error:
        "Our AI models are overloaded right now please wait a bit while, in the meantime you can try out the sysnthesis mode or wait till we fix this issue.",
      message: null,
      results: { web_search_results: [], session_chat: [], memories: [] },
    };
  }
  // handle llm response orchrestration
  const ModelReport = await ExecuteTools(Answer.result, {
    user,
    MessageId,
    Answer: Answer?.result,
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
