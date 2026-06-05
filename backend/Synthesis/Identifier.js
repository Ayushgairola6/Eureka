// SynthesisHandler.js
import { SynthesisStructuredResponse } from "../controllers/GroqInferenceController.js";
import { ToolRegistry } from "./tools.js";
import { IDENTIFIER_PROMPT } from "../Prompts/Prompts.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { HandleDocumentMetadataGathering } from "./PreprocessingHandler.js";
import { GetChatsForContext } from "./phase2_action.js";
import { CacheCurrentChat } from "../CachingHandler/redisClient.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { currentTime, StoreQueryAndResponse } from "../controllers/fileControllers.js";

// ---------------------------------------------------------------
// Entry point – called by your route
// ---------------------------------------------------------------
export const SynthesisResponse = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Please login to continue" });

    const { question, MessageId, userMessageId, selectedDocuments } = req.body;
    if (!question || typeof question !== "string" || !MessageId || typeof MessageId !== "string") {
      return res.status(400).json({ message: "Invalid question or message Id" });
    }

    if (selectedDocuments?.length > 3) {
      return res.status(400).json({
        message: "Selecting too many documents can make AI hallucinate more when generating a response",
      });
    }

    // Rate limit & plan check
    const { status } = await ProcessUserQuery(user, "synthesis");
    if (!status) {
      return res.status(400).json({ message: "You have exceeded your current monthly quota" });
    }

    const { plan_type, error: plan_error } = await CheckUserPlanStatus(user.user_id);
    if (!plan_type || plan_error) {
      return res.status(400).json({ message: "An error occurred while checking your plan status" });
    }

    if (selectedDocuments.length === 0) {
      return res.status(400).json({ message: "Please select atleast one document to ask questions" })
    }
    if (selectedDocuments.length > 3) {
      return res.status(400).json({ message: "Picking too many documents can make the AI hallucinate more." })
    }
    // ---- Gather static context (the older way) ----
    console.log(selectedDocuments)
    const metadata = await HandleDocumentMetadataGathering(selectedDocuments, user);
    if (metadata) {
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: "Metadata_analysis",
          data: [`Analyzed metadata for selected documents`],
        },
      });
    }
    const chats = await GetChatsForContext(user, plan_type);

    // Build the static prompt – same shape as your original
    const staticPrompt = `
User Query: ${question}
plan:${plan_type}
user:${user}
Selected Documents: ${JSON.stringify(selectedDocuments)}
Document Metadata: ${JSON.stringify(metadata)}
Chat_history:${JSON.stringify(chats)}
`.trim();

    // Emit understanding event
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Understanding Request",
        data: ["I am now analyzing the request..."],
      },
    });

    // Cache user's message
    await CacheCurrentChat({
      id: userMessageId,
      sent_by: "You",
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    }, user);

    // ---- Run the orchestrator ----
    const result = await SynthesisOrchestrator({
      staticPrompt,
      systemPrompt: IDENTIFIER_PROMPT,
      memory: [],                // step history array
      lastToolResult: "",        // stringified result of last tool
      user,
      plan: plan_type,
      MessageId,
    }, 0);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    // Cache AI response
    const AiMessage = {
      id: MessageId,
      sent_by: "AntiNode",
      message: { isComplete: true, content: result.answer },
      sent_at: currentTime,
    };
    await CacheCurrentChat(AiMessage, user);
    await StoreQueryAndResponse(user.user_id, question, result.answer, null);

    return res.status(200).json({
      message: "Response generated",
      Answer: result.answer,
      favicon: { MessageId, icon: result.icons || [] },
    });
  } catch (err) {
    console.error("Synthesis error:", err);
    notifyMe("SynthesisHandler error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------
// Recursive orchestrator
// ---------------------------------------------------------------
async function SynthesisOrchestrator(data, iteration) {
  const { staticPrompt, systemPrompt, memory, lastToolResult, user, plan, MessageId } = data;

  // Max iterations reached – force final answer
  if (iteration >= 5) {
    const forced = await SynthesisStructuredResponse(
      `${staticPrompt}\n\nYou have reached the maximum number of steps. Synthesize a complete final answer now based on everything you've gathered.`,
      systemPrompt,
      {},                // options
      lastToolResult,    // stringified last tool result
      memory             // array of step objects
    );

    if (forced.error) {
      return { error: forced.error, answer: null, icons: [] };
    }

    const parsed = ParseResults(forced.result, user.user_id, MessageId);
    return {
      answer: parsed.answer || "I couldn't complete the analysis in time.",
      error: null,
      icons: [],         // no new icons at this point
    };
  }

  // Normal iteration – call the LLM
  const { error, result } = await SynthesisStructuredResponse(
    staticPrompt,
    systemPrompt,
    {},               // no streaming in this loop
    lastToolResult,   // string
    memory            // array
  );

  if (error) {
    return { error, answer: null, icons: [] };
  }

  // Parse the LLM's structured output
  const parsed = ParseResults(result, user.user_id, MessageId);

  if (parsed.error) {
    return { error: parsed.error, answer: null, icons: [] };
  }

  // Done? Return final answer
  if (parsed.answer) {
    return { answer: parsed.answer, error: null, icons: [] };
  }

  // Need a tool? Execute it
  if (parsed.tool_name) {
    // Emit event – tool execution
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "executing_tool",
        data: [`Calling ${parsed.tool_name}`],
      },
    });

    // Execute tool
    const execResult = await ExectueTools(parsed.tool_name, parsed.parameters);

    // Build a string representation for the LLM's next call
    const toolResultString = JSON.stringify(execResult);

    // Update memory with this step
    const newMemory = [
      ...memory,
      {
        step: memory.length + 1,
        thought: result.thought || "",
        current_step: result.current_step || "",
        tool: parsed.tool_name,
        result: toolResultString,
      },
    ];

    // Accumulate favicons if the tool returned any (e.g., search_web)
    let icons = [];
    if (execResult && execResult.favicons) {
      icons = execResult.favicons;
    }

    // Recurse with updated context
    const nextResult = await SynthesisOrchestrator({
      staticPrompt,
      systemPrompt,
      memory: newMemory,
      lastToolResult: toolResultString,
      user,
      plan,
      MessageId,
      // icons will be merged later
    }, iteration + 1);

    // Merge icons from deeper calls
    if (nextResult.icons) {
      icons = [...icons, ...nextResult.icons];
    }

    return {
      answer: nextResult.answer,
      error: nextResult.error,
      icons,
    };
  }

  // Neither answer nor tool call – stuck
  return { error: "Model stuck – no decision made", answer: null, icons: [] };
}

// ---------------------------------------------------------------
// Response parser (unchanged logic)
// ---------------------------------------------------------------
export function ParseResults(response, user_id, MessageId) {
  if (!response || typeof response !== "object") {
    return { error: "Invalid or missing model response object" };
  }

  if (response.thought) {
    EmitEvent(user_id, "query_status", {
      MessageId,
      status: {
        message: "new_thread",
        data: [response.thought],
      },
    });
  }

  // 1. Completed – return final answer
  if (response.completed === true) {
    const finalAnswer = response.final_response || "";
    return {
      answer: finalAnswer,
      tool_name: null,
      parameters: null,
      error: null,
    };
  }

  // 2. Tool call requested
  if (response.tool_call && typeof response.tool_call === "object") {
    console.log(response.tool_call)
    const { tool_name, parameters } = response.tool_call;
    if (!tool_name || typeof tool_name !== "string") {
      return {
        error: "Tool call present but tool_name is missing or invalid",
        answer: null,
        tool_name: null,
        parameters: null,
      };
    }
    return {
      answer: null,
      tool_name,
      parameters: parameters || {},
      error: null,
    };
  }

  // 3. Nothing useful
  return {
    error: "Model response has no final answer and no tool call",
    answer: null,
    tool_name: null,
    parameters: null,
  };
}

// ---------------------------------------------------------------
// Tool executor (fixed)
// ---------------------------------------------------------------
async function ExectueTools(tool_name, parameters) {
  const tool = ToolRegistry[tool_name];
  if (!tool) {
    return { error: `Unknown tool: ${tool_name}`, result: null };
  }

  try {
    const result = await tool.execute(parameters);
    // Normalise output – some tools return { error, data }, some { FormattedResults, favicons }
    if (result && typeof result === "object") {
      if (result.error) {
        return { error: result.error, result: null, tool_name };
      }
      // For web search, preserve favicons
      if (tool_name === "search_web") {
        return {
          error: null,
          result: result.FormattedResults || result.data || result,
          favicons: result.favicons || [],
          tool_name,
        };
      }
      // General tools: return data field if present, else whole object
      return {
        error: null,
        result: result.data !== undefined ? result.data : result,
        tool_name,
      };
    }
    // Primitive result (string, etc.)
    return { error: null, result, tool_name };
  } catch (err) {
    return { error: err.message, result: null, tool_name };
  }
}