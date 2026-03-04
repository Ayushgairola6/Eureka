import { Groq } from "groq-sdk";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import dotenv from "dotenv";
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
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      stream: false,
      top_p: 1,
      max_completion_tokens: 32768,
    });
    if (response && response?.choices[0]?.message?.content) {
      return { error: null, result: response.choices[0].message.content };
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
