import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { CODEBASE_DWELLER } from "../Prompts/Prompts.js";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const token = process.env.TELEGRAMTOKEN;
const bot = new TelegramBot(token, { polling: false });

const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Structured schema for the LLM
const dwellerSchema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      description:
        "Choose 'request_file' to read a doc or codebase file, or 'explain' if you found the solution.",
      enum: ["request_file", "explain"],
    },
    fileName: {
      type: Type.STRING,
      description:
        "The exact path of the file you want to read (e.g., 'architecture.md' or 'config.md'). Required if action is 'request_file'.",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Your final explanation for the developer. Only required if action is 'explain'.",
    },
  },
  required: ["action"],
};

/**
 * Recursive function to analyze errors.
 * @param {string} message - The error message
 * @param {any} error - The error value/stack
 * @param {Array} history - Conversation history for the LLM
 * @param {number} depth - Recursion tracker
 */
async function notifyMe(message, error, history = [], depth = 0) {
  try {
    // Max Recursion Limit (increased slightly since it might need to read a doc AND a code file)
    if (depth >= 5) {
      const finalErrorAnalysis = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `This is the error message=${message}this is the error value=${error}&this is the information you got from the last steps ${JSON.stringify(
                  history.flat()
                )}, now finalize the error cause we have reached our limit`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: CODEBASE_DWELLER,
          temperature: 0.5,
        },
      });
      const response = finalErrorAnalysis.text;
      return await bot.sendMessage(
        MY_CHAT_ID,
        response ||
          `⚠️ **Dweller got lost in the codebase (Max depth reached).**\n\nError: ${
            (message, value)
          }`
      );
    }

    // Initialize history on the very first pass
    if (history.length === 0) {
      history.push({
        role: "user",
        parts: [
          {
            text: `error_message=${message}\n error-value=${
              typeof error !== "string" ? JSON.stringify(error) : error
            }`,
          },
        ],
      });
    }

    // Call the LLM with Structured Outputs enabled
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: history,
      config: {
        systemInstruction: CODEBASE_DWELLER,
        temperature: 0.2, // Lower temp is better when we need accurate file paths
        responseMimeType: "application/json",
        responseSchema: dwellerSchema,
      },
    });

    if (!result.text) throw new Error("Empty response from LLM");

    // Parse the LLM's structured decision
    const responseData = JSON.parse(result.text);

    // =========================================================
    // BRANCH 1: Agent asked to read a file (Doc or Codebase)
    // =========================================================
    if (responseData.action === "request_file" && responseData.fileName) {
      const requestedPath = responseData.fileName;

      // Add the model's request to the history so it remembers what it did
      history.push({
        role: "model",
        parts: [{ text: JSON.stringify(responseData) }],
      });

      let fileContent = "";

      const projectRoot = path.resolve(process.cwd()); // normalize trailing slashes
      const absolutePath = path.resolve(projectRoot, requestedPath);
      // ensure trailing separator so /app doesn't pass for /app-other
      const isWithinProject =
        absolutePath.startsWith(projectRoot + path.sep) ||
        absolutePath === projectRoot;

      const restrictedKeywords = [".env", "node_modules", ".git"];
      const containsRestricted = restrictedKeywords.some((keyword) =>
        requestedPath.includes(keyword)
      );

      if (!isWithinProject) {
        fileContent = `[SYSTEM BLOCK] Access Denied: Cannot access files outside the project root. Requested: ${absolutePath}`;
      } else if (containsRestricted) {
        fileContent = `[SYSTEM BLOCK] Access Denied: Restricted path: ${requestedPath}`;
      } else {
        try {
          const rawContent = await fs.readFile(absolutePath, "utf-8");
          fileContent =
            rawContent.length > 30000
              ? rawContent.substring(0, 30000) + "\n\n...[FILE TRUNCATED]..."
              : rawContent;
        } catch (err) {
          fileContent = `[SYSTEM ERROR] Failed to read ${requestedPath}. Error: ${err.message}`;
        }
      }

      console.log("Filecontent\n", fileContent);
      // Feed the file content back to the LLM as the user
      history.push({
        role: "user",
        parts: [
          {
            text: `[File Content: ${requestedPath}]\n\n${fileContent}\n\nBased on this, do you need another file, or are you ready to 'explain'?`,
          },
        ],
      });

      // Recurse and let the LLM decide what to do next
      return await notifyMe(message, error, history, depth + 1);
    }

    // =========================================================
    // BRANCH 2: The Agent found the bug and is ready to explain
    // =========================================================
    const finalExplanation =
      responseData.explanation || "Agent failed to generate an explanation.";

    return await bot.sendMessage(
      MY_CHAT_ID,
      `👾 **The Dweller Speaks**\n\n${finalExplanation}`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    // Edge Case: Fallback (JSON parse fails, API key invalid, etc)
    return await bot.sendMessage(
      MY_CHAT_ID,
      `🚨 **Raw Error (Dweller is unconscious)**\n\nMessage: ${message}\nValue: ${
        typeof error !== "string" ? JSON.stringify(error) : error
      }`
    );
  }
}

export { notifyMe };
