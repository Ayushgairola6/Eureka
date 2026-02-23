import { ToolRegistry } from "../Synthesis/tools";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater";

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
    return { error: "The tools called by ", message: null };
  }
  const { user, MessageId } = context;
  if (!user) {
    return { error: "Context is missing data", message: null };
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
    return { message: toolsRequired.response, error: null };
  }

  const results = [];
  if (tools_required.length > 0) {
  }
};

//function to find and execute tools

async function OrechrestrateTools(toolsArray, current_index, results, user) {
  //   if we have reached the last tool return
  if (current_index >= toolsArray.length) {
    return { context: results };
  }

  const currentTool = toolsArray[current_index];
  if (currentTool && currentTool?.tool_name) {
    await ToolRegistry?.[currentTool]?.execute(currentTool.arguments, user);
  }
}

// recursive tools executioner only condition based
