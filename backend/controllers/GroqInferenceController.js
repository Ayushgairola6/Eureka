import { Groq } from "groq-sdk";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
import { Intent_identifier_prompt } from "../Prompts/Prompts.js";
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
        type: "json_object",
        // json_schema: {
        //   name: "Intent_agent",
        //   strict: false, // Recommended for guaranteed adherence
        //   schema: {
        //     type: "object",
        //     properties: {
        //       queries: { type: "array", items: { type: "string" } },
        //       direct_answer: { type: "string" },
        //     },
        //     required: ["queries", "direct_answer"],
        //     additionalProperties: false,
        //   },
        // },
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
    const response = await groq.chat.completions.create({
      messages: [
        { content: SYSTEM_PROMPT, role: "system" },
        { role: "user", content: user_prompt },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.5,
      stream: false,
      top_p: 1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "analyst_mode",
          strict: CheckFileTypeAndParseIt,
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
      },
    });
    const data = JSON.parse(response?.choices[0].message.content || "{}");
    if (data) {
      return { error: null, result: data };
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
