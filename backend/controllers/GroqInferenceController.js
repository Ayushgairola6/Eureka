import { Groq } from "groq-sdk";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
import { Intent_identifier_prompt, SUMMARIZER } from "../Prompts/Prompts.js";
import { CheckFileTypeAndParseIt } from "../FilerParsers/FilerParser.js";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_INFERENCE_KEY });

export async function HandleInference(user_prompt, SYSTEM_PROMPT) {
  if (
    !user_prompt ||
    !SYSTEM_PROMPT ||
    typeof user_prompt !== "string" ||
    typeof SYSTEM_PROMPT !== "string"
  ) {
    return {
      error: "Some arguments are either invalid or missing",
      result: null,
    };
  }
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { content: SYSTEM_PROMPT, role: "system" },
        { role: "user", content: user_prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      stream: false,
      top_p: 1,
      response_format: {
        type: "json_object"
      },
    });
    if (!response || !response.choices || response.choices.length === 0) {
      return {
        error: "Our LLM's are overloaded please wait a bit and try again",
        result: null,
      };
    }

    const data = JSON.parse(response?.choices[0].message.content || "{}");

    // if there are queries or a direct_answer
    if (data.direct_answer || data.queries) {
      return { error: null, result: data };
    }
    return {
      error: "Our LLM's are overloaded please wait a bit and try again",
      result: null,
    };
  } catch (groqError) {
    console.error(groqError);
    notifyMe("groq inference error", groqError);
    return {
      error: "Inference error maybe rate limits were hit",
      result: null,
    };
  }
}



export async function SynthesisStructuredResponse(
  query,
  systemPrompt,
  options = {},
  tool_results,
  memory
) {
  if (!query || !systemPrompt) {
    return { error: "Missing query or system prompt", result: null };
  }

  try {
    // Build memory and tool_result strings
    const memory_string = Array.isArray(memory)
      ? memory.map((m) => JSON.stringify(m)).join("\n")
      : typeof memory === "string"
        ? memory
        : JSON.stringify(memory || "");

    const tool_result_string =
      typeof tool_results === "string"
        ? tool_results
        : JSON.stringify(tool_results || "");

    // Build messages
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
      { role: "user", content: `Your_memories=${memory_string}` },
      { role: "user", content: `last_tool_call&results=${tool_result_string}` },
    ];

    const response = await fetch(
      `${process.env.BASE_INFERENCE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_KEY}`,
        },
        body: JSON.stringify({
          model: "stepfun-ai/step-3.7-flash", // or use process.env.MODEL
          messages,
          stream: false,
          temperature: 0.5,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "SynthesisAgent",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  thought: {
                    type: "string",
                    description:
                      "Your step-by-step reasoning about what to do next.",
                  },
                  current_step: {
                    type: "string",
                    description:
                      "A short label for the current action (e.g., 'Looking up document info').",
                  },
                  completed: {
                    type: "boolean",
                    description:
                      "Set to true only when you have the final answer for the user.",
                  },
                  tool_call: {
                    type: ["object", "null"],
                    description:
                      "A tool to execute, or null when completed or no tool is needed.",
                    properties: {
                      tool_name: {
                        type: "string",
                        enum: [
                          "GetDoc_info",
                          "searchByName",
                          "search_knowledge",
                          "get_all_chunks",
                          "get_selected_chunks",
                          "search_web",
                        ],
                        description:
                          "Name of the tool to call. Must be one of the listed tools.",
                      },
                      parameters: {
                        type: "object",
                        description:
                          "Parameters for the selected tool. See system prompt for details on each tool's required parameters.",
                        additionalProperties: true,
                      },
                    },
                    required: ["tool_name", "parameters"],
                    additionalProperties: false,
                  },
                  final_response: {
                    type: ["string", "null"],
                    description:
                      "The complete answer to the user. Set only when completed=true.",
                  },
                },
                required: [
                  "thought",
                  "current_step",
                  "completed",
                  "tool_call",
                  "final_response",
                ],
                additionalProperties: false,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `HTTP ${response.status}: ${errorText}`,
        result: null,
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return { error: "Model returned empty content", result: null };
    }

    // Parse the JSON string
    const parsed = JSON.parse(content);
    return { error: null, result: parsed };
  } catch (error) {
    console.error("[SynthesisStructuredResponse] fetch error:", error);
    return { error: error.message || "LLM inference error", result: null };
  }
}
// nvidia api
export const StructuredResponseGenerator = async (prompt, systemPrompt) => {
  try {
    const response = await fetch(`${process.env.BASE_INFERENCE_URL}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_KEY}`, },
      body: JSON.stringify({
        model: 'stepfun-ai/step-3.7-flash',
        messages: [
          { role: "user", content: prompt },
          { role: "system", content: systemPrompt }
        ],
        stream: false,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "web-search-agent",
            strict: true,
            schema: {
              type: "object",
              properties: {
                queries: {
                  type: "array",
                  items: { type: "string" },
                  description: "Search queries to use on the web"
                },
                direct_answer: {
                  type: "string",
                  description: "Response if no web search is needed"
                }
              },
              required: ["direct_answer", "queries"],
              additionalProperties: false
            }
          }
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { error: new Error(`HTTP ${response.status}: ${errorText}`), result: null };
    }

    const results = await response.json();
    const content = results?.choices?.[0]?.message?.content;
    return { error: null, result: JSON.parse(content) };
  } catch (error) {
    console.log("inference error", error);
    return { error: error.message, result: null };
  }
};

// only for analyst mode strcutured response handler
export async function StructuredOutPutInferenceHandler(
  user_prompt,
  SYSTEM_PROMPT
) {
  if (
    !user_prompt ||
    !SYSTEM_PROMPT ||
    typeof user_prompt !== "string" ||
    typeof SYSTEM_PROMPT !== "string"
  ) {
    return {
      error: "Some arguments are either invalid or missing",
      result: null,
    };
  }
  try {

    const response = await fetch(`${process.env.BASE_INFERENCE_URL}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_KEY}`, },
      body: JSON.stringify({
        model: 'stepfun-ai/step-3.7-flash',
        messages: [
          { role: "user", content: user_prompt },
          { role: "system", content: SYSTEM_PROMPT }
        ],
        stream: false,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "analyst_mode",
            strict: true,
            schema: {
              type: "object",
              properties: {
                confidence_score: { type: "number" },
                thought: { type: "string" },
                queries: { type: "array", items: { type: "string" } },
                direct_answer: { type: "string" },
              },
              required: ["confidence_score", "thought"],
              additionalProperties: false,
            },
          },
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: new Error(`HTTP ${response.status}: ${errorText}`), result: null };
    }

    const results = await response.json();
    const content = results?.choices?.[0]?.message?.content;
    // const data = JSON.parse(response?.choices[0].message.content || "{}");
    if (content) {
      return { error: null, result: JSON.parse(content) };
    }
    return {
      error: "Our LLM's are overloaded please wait a bit and try again",
      result: null,
    };

  } catch (error) {
    console.error("Structured inference error\n", error);
    return {
      error: "Inference error maybe rate limits were hit",
      result: null,
    };
  }
}

export async function FindIntent(instructions) {
  if (!instructions || typeof instructions !== "string")
    return { status: false, result: null };

  const response = await groq.chat.completions.create({
    messages: [
      { content: Intent_identifier_prompt, role: "system" },
      { role: "user", content: instructions },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    stream: false,
    top_p: 1,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "intent_classifier",
        strict: true,
        schema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              enum: ["dig_deeper", "finalize_report", "not_sure"],
            },
          },
          required: ["intent"],
          additionalProperties: false,
        },
      },
    },
  });

  const data = JSON.parse(response?.choices[0].message.content || "{}");
  if (data) {
    return { status: true, result: data };
  }
  return {
    status: false,
    result: null,
  };
}


export const Summarize = async (context) => {
  const token = process.env.HF_ACCESS_TOKEN; // Read from environment
  const model = `qwen2.5:3b-instruct-q4_K_M`;

  const response = await fetch(
    "https://i-feel-eureka-Inference.hf.space/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // <-- Add this line
      },
      body: JSON.stringify({
        model: "LiquidAI/lfm2.5-350m:q4_k_m",
        messages: [
          { role: "system", content: SUMMARIZER },
          { role: "user", content: context },
        ],
        temperature: 0.1,
        topK: 50,
        repetition_penalty: 1.05,
      }),
      signal: AbortSignal.timeout(200_000),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error("API Error:", response.status, data);
    throw new Error(`API request failed: ${response.status}`);
  }
  return data?.choices?.[0]?.message?.content;
};