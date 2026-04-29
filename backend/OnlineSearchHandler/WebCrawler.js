import {
  CheerioCrawler,
  MemoryStorage,
  Configuration,
  log,
  PlaywrightCrawler,
} from "crawlee";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom"; // Much lighter than JSDOM
import TurndownService from "turndown";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import axios from "axios";
import dotenv from "dotenv";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { GenerateEmbeddings } from "../controllers/ModelController.js";
import { cosineSimilarity } from "./utils/math.js"; // You'll need a simple math helper
import { splitTextIntoChunks } from "../controllers/fileControllers.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ApifyClient } from "apify-client";
dotenv.config();

const turndown = new TurndownService({ headingStyle: "atx" });
const apify_client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});
export async function GetDataFromSerper(
  query,
  user,
  MessageId,
  room_id,
  plan_type
) {
  if (!query?.trim() || !cleanAndSplitQueries(query)) {
    return { error: "Query parameter is required and cannot be empty" };
  }
  // as the function returns an array of queries join them
  const cleanedQuery = cleanAndSplitQueries(query)?.join("; ");
  // if the query is from a room_send the event to the whole room
  if (room_id) {
    EmitEvent(room_id, "query_status", {
      MessageId,
      status: {
        message: "fetching_url",
        data: [`Searching for ${cleanedQuery}`],
      },
    });
  } else {
    // else send it the solo user
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "fetching_url",
        data: [`Searching for ${cleanedQuery}`],
      },
    });
  }

  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: cleanedQuery, num: plan_type !== "free" ? 10 : 5 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_WEB_API,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    notifyMe("An error has been sent by serper", error);
    return {
      error: "Error while processing web search",
      details: error?.response?.data?.message || error.message,
    };
  }
}

//formatter for serper.dev api results
export function FilterUrlForExtraction(data, user, MessageId, room_id) {
  const LinksToProcess = [];

  if (data?.organic && data.organic?.length > 0) {
    data.organic.forEach((obj) => {
      if (obj.link) {
        LinksToProcess.push(obj.link);
      }
    });
  }

  // if a room request send the event to the room else send it  to the user
  if (room_id) {
    EmitEvent(room_id, "query_status", {
      MessageId,
      status: {
        message: "processing_links",
        data: LinksToProcess,
      },
    });
  } else {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "processing_links",
        data: LinksToProcess,
      },
    });
  }

  return LinksToProcess;
}

// scraping the data from web
// Assuming you have your existing imports for turndown, Readability, parseHTML, etc.

export const ProcessForLLM = async (
  links,
  user,
  userQuery,
  MessageId,
  room_id,
  plan_type
) => {
  try {
    const filteredLinks = filterResearchLinks(links); //clean the links
    if (
      !filteredLinks ||
      !Array.isArray(filteredLinks) ||
      !userQuery ||
      typeof userQuery !== "string"
    ) {
      return [];
    }
    const data = {
      links: filteredLinks,
      userQuery: userQuery,
      userId: user.user_id || room_id,
      MessageId,
    };

    const response = await fetch(
      "https://ThornsOfSnow-Antinode-web-search.hf.space/api/search",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
    // notifyMe("An error in the process llm handler\n", err);
    return [];
  }
};
//formatting for the llm
export function FormattForLLM(ScrapedData) {
  if (!ScrapedData || !Array.isArray(ScrapedData) || ScrapedData.length === 0) {
    return { error: "The scraped data array empty or not valid" };
  }

  const FinalContent = [];
  const favicons = [];
  const urls = [];
  // process the results
  ScrapedData.forEach((object) => {
    if (object && object?.markdown) {
      const data = {
        title: object?.title,
        content: object.markdown,
        url: object?.url,
        score: object?.score || "Unknown",
      };

      // push the llm object
      FinalContent.push(data);
      // add the favicon
      if (object?.favicon) {
        favicons.push(object.favicon);
      }
      if (object?.url) {
        urls.push(object.url);
      }
    }
  });

  return {
    favicons,
    FinalContent,
    urls,
  };
}

// filtering out the links for research and deep we search
const filterResearchLinks = (links) => {
  // 1. Extensions we Explicitly WANT (The "Gold" List)
  const researchExtensions = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".rtf",
    ".txt", // Documents
    ".csv",
    ".xls",
    ".xlsx",
    ".json", // Datasets
    ".ppt",
    ".pptx", // Presentations
  ]);

  // 2. Extensions we definitely HATE (Media/Executables)
  const junkExtensions = new Set([
    ".jpg",
    ".png",
    ".gif",
    ".mp4",
    ".mp3", // Media
    ".exe",
    ".dmg",
    ".iso",
    ".zip",
    ".tar", // Binaries (Keep zips only if you want bulk data)
  ]);

  return links.filter((link) => {
    try {
      const parsedUrl = new URL(link);

      // Rule 1: Protocol - Allow HTTP/HTTPS.
      // Note: If you want FTP, you need a different crawler class than CheerioCrawler!
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return false;
      }

      // Rule 2: The "Localhost" Guard (Security)
      if (
        parsedUrl.hostname.includes("localhost") ||
        parsedUrl.hostname === "127.0.0.1"
      ) {
        return false;
      }

      const pathname = parsedUrl.pathname.toLowerCase();
      const extension = pathname.substring(pathname.lastIndexOf("."));

      // Rule 3: If it's explicitly junk, toss it.
      if (junkExtensions.has(extension)) {
        return false;
      }

      // Rule 4: The "Deep Web" Nuance
      // If the URL has NO extension (e.g. /view/1234), keep it!
      // It might be a dynamic endpoint serving a PDF.
      if (!extension || extension.length > 5) {
        return true;
      }

      // Rule 5: If it has an extension, is it in our "Gold" list?
      // Or is it a standard web page (.html, .php, .asp)?
      const isWebPage = [
        ".html",
        ".htm",
        ".php",
        ".asp",
        ".aspx",
        ".jsp",
      ].includes(extension);

      if (researchExtensions.has(extension) || isWebPage) {
        return true;
      }

      // Default: If we aren't sure, keep it (safer for deep scraping)
      return true;
    } catch (err) {
      return false;
    }
  });
};

export function extractHighValueChunks(pageText, userQuery, maxTokens) {
  const estimateTokens = (text) => Math.ceil(text.length / 4);

  // 1. Clean the query and remove common words (Stop-words)
  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "and",
    "a",
    "an",
    "for",
    "with",
    "about",
  ]);
  const queryWords = userQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) return null;

  // 2. Split page into paragraph chunks safely
  const rawChunks = pageText
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter((c) => c.length > 40); // Ignore tiny fragments

  // 3. Lightweight Math Scoring (TF-IDF style)
  function scoreChunk(chunk) {
    let score = 0;
    const lowerChunk = chunk.toLowerCase();

    // A. Phrase Match (Huge bonus if the exact query phrase appears)
    if (lowerChunk.includes(userQuery.toLowerCase())) {
      score += 10;
    }

    // B. Keyword Term Frequency
    for (const word of queryWords) {
      // Split chunk into words to avoid partial matches (e.g., "car" matching "careless")
      const wordsInChunk = lowerChunk.split(/\W+/);
      const occurrences = wordsInChunk.filter((w) => w === word).length;

      if (occurrences > 0) {
        // Reward frequency, but use Math.sqrt to prevent keyword stuffing
        // (e.g., 1 match = 3 pts, 4 matches = 6 pts)
        score += 3 * Math.sqrt(occurrences);
      }
    }

    // C. Data Density Bonus (Numbers, Dollars, Percentages, Years)
    if (/\$|%|\b\d{1,3}(,\d{3})+(\.\d+)?\b|\b202[0-9]\b/.test(chunk)) {
      score += 2;
    }

    return score;
  }

  // Score all chunks
  const scoredChunks = rawChunks
    .map((chunk, idx) => ({ idx, score: scoreChunk(chunk) }))
    .filter((c) => c.score > 1) // Drop chunks with basically no relevance
    .sort((a, b) => b.score - a.score); // Sort best to worst

  // 4. Safe Context Extraction (Grabs surrounding paragraphs without duplicating text)
  const selectedIndices = new Set();
  let currentTokens = 0;

  for (const item of scoredChunks) {
    // Grab the high-scoring chunk AND the paragraphs right before and after it
    const indicesToAdd = [item.idx - 1, item.idx, item.idx + 1].filter(
      (i) => i >= 0 && i < rawChunks.length && !selectedIndices.has(i)
    );

    let tokensForThese = 0;
    for (const i of indicesToAdd) {
      tokensForThese += estimateTokens(rawChunks[i] + "\n\n");
    }

    // Stop if we hit our token limit to save money on the LLM side
    if (currentTokens + tokensForThese > maxTokens) {
      if (currentTokens >= maxTokens * 0.9) break;
      continue;
    }

    // Add them to our final list
    for (const i of indicesToAdd) {
      selectedIndices.add(i);
    }
    currentTokens += tokensForThese;
  }

  if (selectedIndices.size === 0) return null;

  // 5. CRITICAL: Sort chronologically so the LLM reads it in the right order
  const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);

  let pageContext = "";
  let lastIdx = -2;

  // 6. Build the final string
  for (const idx of sortedIndices) {
    // Inject a visual break if we skipped paragraphs, letting the LLM know text was omitted
    if (lastIdx !== -2 && idx - lastIdx > 1) {
      pageContext += "\n\n[...]\n\n";
    }
    pageContext += rawChunks[idx] + "\n";
    lastIdx = idx;
  }

  return {
    score: scoredChunks[0]?.score || 0, // Return highest chunk score as page score
    content: pageContext.trim(),
  };
}

const cleanAndSplitQueries = (llmResponse) => {
  return llmResponse
    .split(";") // Split by your separator
    .map((query) => {
      return query
        .replace(/[`*]/g, "") // Remove markdown backticks or bolding
        .replace(/^[0-9.\s-]+/, "") // Remove leading numbers (1. 2. etc)
        .replace(/;+$/, "") // Remove trailing semicolons
        .trim(); // Remove surrounding whitespace
    })
    .filter((query) => query.length > 3); // Ignore empty/useless strings
};

// extracts relevant information from scraped search results for better context matching

const HandleContextFiltering = async (CurrentContext, userQuery) => {
  try {
    const { content, title, url } = CurrentContext;

    if (!content || !title || !url) {
      return { error: "Missing required fields", content: null };
    }

    const webContentSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ". ", " "],
    });

    const chunks = await webContentSplitter.splitText(content); //create chunks large ones
    // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); //a slight delay for controller rate limits
    if (chunks.length === 0) {
      return { content: null, score: 0 };
    }

    let UserPromptEmbeddings = await GenerateEmbeddings(
      userQuery,
      "SEMANTIC_SIMILARITY"
    );
    // if first try fails wait a bit and try again
    if (!UserPromptEmbeddings || UserPromptEmbeddings?.error) {
      await new Promise((res) => setTimeout(res, 700));

      try {
        UserPromptEmbeddings = await GenerateEmbeddings(
          userQuery,
          "SEMANTIC_SIMILARITY"
        );
      } catch (retryError) {
        return { content: null, score: 0 };
      }
    }
    const batchSize = 30;
    const results = [];
    const allEmbeddings = await GenerateEmbeddingsRecursive(
      chunks,
      "RETRIEVAL_DOCUMENT",
      0,
      results,
      batchSize
    );

    // Score inline, no recursion needed here
    const scoredChunks = chunks
      .map((chunk, i) => ({
        chunk,
        score: allEmbeddings[i]
          ? cosineSimilarity(
              UserPromptEmbeddings?.[0]?.values,
              allEmbeddings?.[i].values
            )
          : 0,
      }))
      .filter((c) => c.score > 0.65)
      .sort((a, b) => b.score - a.score);

    const finalMarkdown = scoredChunks
      .map((s) => `[Source: ${title}](${url})\n${s.chunk}`)
      .join("\n\n---\n\n");
    return { content: finalMarkdown, score: scoredChunks[0]?.score || 0 };
  } catch (err) {
    console.error("Context filtering error:", err);
    notifyMe("Context filtering error", err);
    return { content: null, score: 0 };
  }
};

//a tick based embedding function that asks for new embeddings only when previous one finishes recursively
const GenerateEmbeddingsRecursive = async (
  chunks,
  taskType,
  currentIndex,
  results,
  BATCH_SIZE
) => {
  // Base case - all chunks processed
  if (currentIndex >= chunks.length) return results;

  const batch = chunks.slice(currentIndex, currentIndex + BATCH_SIZE);

  const batchEmbeddings = await GenerateEmbeddings(batch, taskType);

  if (batchEmbeddings && !batchEmbeddings.error) {
    results.push(...batchEmbeddings);
  } else {
    // Push nulls to maintain index alignment with chunks
    results.push(...new Array(batch.length).fill(null));
  }

  // Delay between batches then trigger next tick
  await new Promise((resolve) => setTimeout(resolve, 500));

  return GenerateEmbeddingsRecursive(
    chunks,
    taskType,
    currentIndex + BATCH_SIZE,
    results,
    BATCH_SIZE
  );
};

export async function ApifyWebHook(req, res) {
  try {
    const { message, link } = req.body;

    // 1. Basic Validation
    if (!message || !link) {
      return res
        .status(400)
        .json({ error: "Missing message or link in payload" });
    }

    console.log(`Received webhook: ${message} for ${link}`);

    // 2. Handle specific message types
    switch (message) {
      case "LINK_READ":
        await handleLinkRead(link);
        break;

      case "PAGE_READ":
        await handlePageRead(link);
        break;

      default:
        console.warn(`Unknown message type received: ${message}`);
        return res.status(422).json({ error: "Unrecognized message type" });
    }

    // 3. Respond to the standalone server with success
    // This prevents the 'res.ok' check in your SendWebhook function from failing
    return res.status(200).json({ status: "success", received: message });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
