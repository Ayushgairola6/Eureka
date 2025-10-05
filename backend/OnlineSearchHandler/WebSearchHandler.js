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

    const response = await tvly.search(query, {
      searchDepth: "basic",
      maxTokens: 20,
      includeAnswer: true,
      include_image_descriptions: true,
      includeFavicon: true,
    });
    if (!response) {
      return { error: "Unable to find results online" };
    }
    const favicons = [];
    if (response.results.length > 0) {
      response.results.forEach((res) => {
        if (res.favicon && !favicons.includes(res.favicon)) {
          favicons.push(res.favicon);
        }
      });
    }
    return { response: response, favicon: favicons };
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
    // the tavily web search answer
    combinedContent += `Answer from web search : ${results.answer}`;

    results.results.forEach((res, index) => {
      combinedContent += `### Source ${index + 1}: ${res.title}\n`;
      combinedContent += `URL: ${res.url}\n`;
      combinedContent += `Content: ${res.content}\n\n`;
    });
  }
  if (results.answer) {
    combinedContent += results.answer;
  }

  // The model's conversation history must alternate between "user" and "model" roles.
  // The context from search results should be treated as part of the user's turn.
  return [
    {
      role: "model",
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
    const Formattedresult = formatForGemini(webresults);
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
    return {
      text: `❌ I couldn't find any relevant updates about your query.`,
      favicons: [],
    };
  }

  let fallbackText = `## 🔍 Search Results\n\n`;
  const favicons = [];

  // Add Tavily's direct answer if available - as a highlighted section
  if (searchResult.answer) {
    fallbackText += `### 💡 Quick Summary\n${searchResult.answer}\n\n---\n\n`;
  }

  // Format each result with clean markdown
  searchResult.results.forEach((res, index) => {
    fallbackText += `### ${index + 1}. ${res.title || "Search Result"}\n\n`;

    // Add favicon if available
    if (res.favicon && !favicons.includes(res.favicon)) {
      favicons.push(res.favicon);
    }

    // Source link
    if (res.url) {
      fallbackText += `**Source:** [${new URL(res.url).hostname}](${
        res.url
      })\n\n`;
    }

    // Score indicator (subtle)
    if (res.score) {
      const scorePercent = Math.round(res.score * 100);
      fallbackText += `**Relevance:** ${scorePercent}%\n\n`;
    }

    // Clean and format content
    if (res.content) {
      let cleanContent = res.content
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\*   ### /g, "\n**") // Convert bullet points to bold
        .replace(/\*   /g, "\n• ") // Convert asterisks to proper bullets
        .replace(/##### /g, "**") // Convert hashes to bold
        .replace(/Image \d+/g, "") // Remove image placeholders
        .replace(/\[Skip to main content\]\([^)]+\)/g, "") // Remove skip links
        .replace(/Toggle navigation Menu/g, "") // Remove navigation text
        .replace(/\[S D\]\([^)]+\)/g, "") // Remove navigation icons
        .trim();

      // Limit content length and ensure proper formatting
      if (cleanContent.length > 400) {
        cleanContent = cleanContent.substring(0, 400) + "...";
      }

      if (cleanContent) {
        fallbackText += `**Summary:** ${cleanContent}\n\n`;
      }
    }

    // Raw content as additional context (limited)
    if (res.raw_content) {
      const rawClean = res.raw_content
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 200);

      if (rawClean && rawClean.length > 50) {
        fallbackText += `**Additional Context:** ${rawClean}${
          rawClean.length === 200 ? "..." : ""
        }\n\n`;
      }
    }

    if (index < searchResult.results.length - 1) {
      fallbackText += "---\n\n";
    }
  });

  // Footer with helpful information
  fallbackText += "\n---\n";
  fallbackText +=
    "\n💡 **Tip:** For the most accurate and verified information, try searching within our community-powered knowledge base where content is peer-reviewed.";

  return {
    text: fallbackText,
    favicons: favicons,
  };
};
