import { tavily } from "@tavily/core";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs/promises"; // Use fs/promises for async/await
import path from "path";
import { GenerateResponse } from "../controllers/ModelController.js";
import // splitMarkdown,
// splitMarkdownByHeadings,
"../FilerParsers/FilerParser.js";
import { StoreQueryAndResponse } from "../controllers/fileControllers.js";
import { chunkMarkdown, formatSSEChunk } from "../FilerParsers/FilerParser.js";
const tvly = tavily({ apiKey: process.env.TAVILY_WEB_SEARCH_API_KEY });

export const SearchQueryResults = async (query) => {
  try {
    if (!query || typeof query !== "string") {
      return { error: "Invalid query type" };
    }

    const response = await tvly.search(query);
    if (!response) {
      return { error: "Unable to find results online" };
    }
    return response;
  } catch (error) {
    return { error };
  }
};

// formatting search result for AI
export function formatForGemini(results) {
  let combinedContent =
    "Here is some information from the internet to help you answer the user's question:\n\n";

  if (!results || results.results.length === 0) {
    combinedContent += "No relevant information was found.";
  } else {
    results.results.forEach((res, index) => {
      combinedContent += `### Source ${index + 1}: ${res.title}\n`;
      combinedContent += `URL: ${res.url}\n`;
      combinedContent += `Content: ${res.content}\n\n`;
    });
  }

  // The model's conversation history must alternate between "user" and "model" roles.
  // The context from search results should be treated as part of the user's turn.
  return [
    {
      role: "user",
      parts: [{ text: combinedContent }],
    },
  ];
}

// Searhc the web and write the message for client
export const WebSearchHandle = async (req, res) => {
  try {
    if (!req.user) {
      res.write(`event:Please login to continue\n`);
      res.end();
    }
    const { question } = req.query;
    if (!question) {
      res.write("event:Invalid question\n");
      res.end();
    }

    const webresults = await SearchQueryResults(question);
    if (webresults.error) {
      res.write("event:Could not find vaid information online\n");
      res.end();
    }
    const Formattedresult = await formatForGemini(webresults);
    if (!Formattedresult) {
      res.write("event:Could not find valid information online\n");
      res.end();
    }

    const WebResultPrompt = process.env.WEB_SEARCH_RESULT_PROMPT;
    const Answer = await GenerateResponse(
      question,
      Formattedresult,
      WebResultPrompt
    );
    if (!Answer || Answer.error) {
      res.write("event:Could not find vaid information online\n");
      res.end();
    }

    const Store = await StoreQueryAndResponse(
      req.user.user_id,
      question,
      Answer
    );
    if (Store.error) {
      console.log(Store.error);
    }

    const Chunks = chunkMarkdown(Answer);
    let i = 0;
    const interval = 80;
    // condition to avoid big chunks
    const charSender = setInterval(() => {
      if (i < Chunks.length) {
        // const safeChunk = markdown.charAt(i);
        res.write(formatSSEChunk(Chunks[i]));
        i++;
      } else {
        clearInterval(charSender);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, interval);

    req.on("close", () => {
      console.log("Client disconnected");
      res.end();
    });
  } catch (error) {
    console.log(error);
  }
};

export const FormatForHumanFallback = (searchResult) => {
  if (
    !searchResult ||
    !searchResult.results ||
    searchResult.results.length === 0
  ) {
    return `❌ I couldn't find any relevant updates.`;
  }

  let fallbackText = `# 🌐 Web Results for: *${searchResult.query}*\n\n`;

  // Add Tavily's direct short answer if available
  if (searchResult.answer) {
    fallbackText += `**Quick Summary:** ${searchResult.answer}\n\n---\n\n`;
  }

  // Add images if any exist
  if (searchResult.images && searchResult.images.length > 0) {
    searchResult.images.forEach((imgUrl) => {
      fallbackText += `![Result Image](${imgUrl})\n\n`;
    });
    fallbackText += "---\n\n";
  }

  // Loop through results
  searchResult.results.forEach((res, index) => {
    fallbackText += `## 🔎 Result ${index + 1}\n\n`;

    // Title & link
    if (res.title && res.url) {
      fallbackText += `**[${res.title}](${res.url})**\n\n`;
    } else if (res.title) {
      fallbackText += `**${res.title}**\n\n`;
    }

    // Main content
    if (res.content) {
      const cleanContent = res.content.replace(/\s+/g, " ").trim();

      // If it's structured text (like multiple headings in one string)
      if (cleanContent.match(/##|###|[:\{\}\[\]]/)) {
        fallbackText += "```markdown\n" + cleanContent + "\n```\n\n";
      } else {
        fallbackText += cleanContent + "\n\n";
      }
    }

    // Divider
    fallbackText += "---\n\n";
  });

  // Attribution footer
  fallbackText += `✨ Powered by [Tavily Search](https://tavily.com)`;

  return fallbackText;
};
