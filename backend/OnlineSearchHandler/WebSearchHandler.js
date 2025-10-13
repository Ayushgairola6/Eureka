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
      maxTokens: 10,
      includeAnswer: "basic",
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
      text: `I couldn't find any relevant information about your query. Please try rephrasing your question or check if there are any spelling errors.`,
      favicons: [],
    };
  }

  let fallbackText = "";
  const favicons = [];

  // Always include the direct answer if available - as main heading
  if (searchResult.answer) {
    fallbackText += `## ${searchResult.answer}\n\n`;
  }

  // Compile comprehensive content from all results
  const contentSections = [];

  searchResult.results.forEach((res, index) => {
    // Add favicon if available
    if (res.favicon && !favicons.includes(res.favicon)) {
      favicons.push(res.favicon);
    }

    let resultContent = "";

    // Include title as subheading
    if (res.title) {
      resultContent += `### ${res.title}\n\n`;
    }

    // Include main content - preserve existing markdown
    if (res.content) {
      let cleanContent = res.content
        .replace(/\s+/g, " ") // Normalize whitespace only
        .replace(/Image \d+/g, "") // Remove image placeholders
        .replace(/\[Skip to main content\]\([^)]+\)/g, "") // Remove skip links
        .replace(/Toggle navigation Menu/g, "") // Remove navigation text
        .replace(/\[S D\]\([^)]+\)/g, "") // Remove navigation icons
        .trim();

      // Convert plain text paragraphs to markdown if no existing markdown
      if (cleanContent.length > 50) {
        if (
          !cleanContent.includes("#") &&
          !cleanContent.includes("*") &&
          !cleanContent.includes("`")
        ) {
          // Convert to proper markdown paragraphs
          const sentences = cleanContent
            .split(". ")
            .filter((s) => s.length > 10);
          if (sentences.length > 0) {
            resultContent +=
              sentences
                .map((sentence) =>
                  sentence.endsWith(".") ? sentence : sentence + "."
                )
                .join(" ") + "\n\n";
          } else {
            resultContent += cleanContent.substring(0, 500) + "\n\n";
          }
        } else {
          // Preserve existing markdown
          resultContent += cleanContent.substring(0, 500) + "\n\n";
        }

        if (cleanContent.length > 500) {
          resultContent += "...\n\n";
        }
      }
    }

    // Include raw_content if available and different from main content
    if (res.raw_content && res.raw_content !== res.content) {
      const cleanRawContent = res.raw_content.replace(/\s+/g, " ").trim();

      if (
        cleanRawContent.length > 50 &&
        !resultContent.includes(cleanRawContent.substring(0, 100))
      ) {
        resultContent +=
          "**Additional details:** " + cleanRawContent.substring(0, 300);
        if (res.raw_content.length > 300) {
          resultContent += "...";
        }
        resultContent += "\n\n";
      }
    }

    // Add score as relevance indicator
    if (res.score && res.score > 0.7) {
      resultContent += `_Highly relevant source_\n\n`;
    }

    if (resultContent) {
      contentSections.push(resultContent);
    }
  });

  // Create flowing narrative from all content
  if (contentSections.length > 0) {
    if (!searchResult.answer) {
      fallbackText += "## Research Findings\n\n";
    } else {
      fallbackText += "### Key Insights\n\n";
    }

    contentSections.forEach((content, index) => {
      fallbackText += content;
      if (index < contentSections.length - 1) {
        fallbackText += "---\n\n";
      }
    });
  }

  // Include response time and metadata if available
  if (searchResult.response_time) {
    fallbackText += `> Search completed in ${searchResult.response_time}s\n\n`;
  }

  // Add comprehensive sources section
  if (searchResult.results.length > 0) {
    fallbackText += "### 📚 Sources Referenced\n\n";

    searchResult.results.forEach((res, index) => {
      const domain = res.url ? new URL(res.url).hostname : "Source";
      const title = res.title || "Search Result";
      const scorePercent = res.score ? Math.round(res.score * 100) : null;

      fallbackText += `${index + 1}. **${title}**\n`;

      if (res.url) {
        fallbackText += `   - 🔗 [${domain}](${res.url})\n`;
      }

      if (scorePercent) {
        fallbackText += `   - 📊 ${scorePercent}% relevance score\n`;
      }

      fallbackText += "\n";
    });
  }

  // Include query information
  if (searchResult.query) {
    fallbackText += `_Search query: "${searchResult.query}"_`;
  }

  return {
    text: fallbackText.trim(),
    favicons: favicons,
  };
};
