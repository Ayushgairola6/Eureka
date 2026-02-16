import { CheerioCrawler, MemoryStorage, Configuration, log } from "crawlee";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom"; // Much lighter than JSDOM
import TurndownService from "turndown";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import axios from "axios";
import dotenv from "dotenv";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { getJson } from "serpapi";
dotenv.config();

const turndown = new TurndownService({ headingStyle: "atx" });

// serper query
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

/// serper api backup
export const GetDataFromSerpApi = async (query, user, plan_type) => {
  try {
    const SERPAPI_KEY = process.env.SERP_API;
    const response = await getJson({
      engine: "google_light",
      api_key: SERPAPI_KEY,
      q: query,
      google_domain: "google.com",
      hl: "en",
      num: plan_type === "free" ? 1 : 5,
    });

    return response.data;
  } catch (error) {
    await notifyMe("An error has been sent by serperAPI", error);
    return { error: error }; // Return empty array so your scraper doesn't crash
  }
};
// filter the results into links and ready them for jina-reader

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
export const ProcessForLLM = async (
  links,
  user,
  userQuery,
  MessageId,
  room_id
) => {
  const dataset = [];
  turndown.remove(["img", "iframe", "script", "style", "noscript"]);

  const validLinks = filterResearchLinks(links);

  const config = new Configuration({
    persistStorage: false,
    storageClient: new MemoryStorage({ persistStorage: false }),
  });

  log.setLevel(log.LEVELS.OFF);
  const crawler = new CheerioCrawler(
    {
      // config,
      // proxyConfig,
      minConcurrency: 10,
      maxConcurrency: 20,
      maxRequestRetries: 2, // Don't keep trying if it fails once
      requestHandlerTimeoutSecs: 20, // Keep it snappy
      useSessionPool: false,
      failedRequestHandler: ({ request }) => {},
      async requestHandler({ request, body, $ }) {
        if (room_id) {
          EmitEvent(room_id, "query_status", {
            MessageId,
            status: {
              message: "reading_links",
              data: [`Reading: ${new URL(request.url).hostname}`],
            },
          });
        } else {
          EmitEvent(user.user_id, "query_status", {
            MessageId,
            status: {
              message: "reading_links",
              data: [`Reading: ${new URL(request.url).hostname}`],
            },
          });
        }

        // 1. Quick Check: If Cheerio ($) sees the page is empty or tiny, skip immediately
        if (body.length < 500) return;

        const { document } = parseHTML(body);

        const reader = new Readability(document);
        const article = reader.parse();

        if (article && article.content) {
          const markdown = turndown.turndown(article.content);

          if (markdown.length < 200) return;
          const wordCount = article.textContent.split(/\s+/).length;

          const ProcessedPage = extractHighValueChunks(
            { url: request.url, title: article.title, content: markdown },
            userQuery
          );
          const object = {
            title: article.title,
            url: request.url,
            favicon: `https://www.google.com/s2/favicons?domain=${
              new URL(request.url).hostname
            }&sz=64`,
            markdown: ProcessedPage.content,
            score: ProcessedPage.score,
            estimatedTokens: Math.ceil(markdown.length / 4),
          };
          // await notifyMe(JSON.stringify(object));

          if (room_id) {
            EmitEvent(room_id, "query_status", {
              MessageId,
              status: {
                message: "Cleaning_Context",
                data: [ProcessedPage.content.slice(0, 500)],
              },
            });
          } else {
            EmitEvent(user.user_id, "query_status", {
              MessageId,
              status: {
                message: "Cleaning_Context",
                data: [ProcessedPage.content.slice(0, 500)],
              },
            });
          }

          dataset.push(object);
        }
      },
    },
    config
  );

  await crawler.run(validLinks);
  return dataset;
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

//find relevant information from the chunks
// function extractHighValueChunks(text, query, maxTokens = 3000) {
//   const words = query.toLowerCase().split(" ");
//   const chunks = text.split("\n\n"); // Break by paragraphs

//   const scoredChunks = chunks.map((chunk) => {
//     let score = 0;
//     words.forEach((word) => {
//       if (chunk.toLowerCase().includes(word)) score += 1;
//     });
//     return { chunk, score };
//   });

//   // Sort by relevance and take the top ones until we hit the token limit
//   const bestChunks = scoredChunks
//     .sort((a, b) => b.score - a.score)
//     .filter((item) => item.score > 0)
//     .slice(0, 5); // Take top 5 relevant paragraphs

//   return bestChunks.map((c) => c.chunk).join("\n\n");
// }
function extractHighValueChunks(page, query, maxTokens = 3500) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const estimateTokens = (text) => Math.ceil(text.length / 4);

  // ---------- scoring helpers ----------

  function scoreChunk(chunk) {
    const lower = chunk.toLowerCase();
    let score = 0;

    // keyword relevance
    for (const word of queryWords) {
      if (lower.includes(word)) score += 1;
    }

    // numeric / factual density
    if (/\$|%|\b\d{4}\b/.test(chunk)) score += 3;

    // projections / analysis language
    if (/forecast|projected|estimate|cagr|expected|by \d{4}/i.test(chunk))
      score += 2;

    // discrepancies / contrast cues
    if (/however|but|whereas|contrast|although|discrepancy/i.test(chunk))
      score += 2;

    // source indicators
    if (/report|study|survey|according to|source/i.test(chunk)) score += 1;

    return score;
  }

  function scorePage(text) {
    let score = 0;
    if (/\$|%|\b\d{4}\b/.test(text)) score += 3;
    if (/report|study|analysis|data|survey/i.test(text)) score += 2;
    if (/blog|opinion|thoughts/i.test(text)) score -= 1;
    return score;
  }

  // ---------- page scoring ----------

  const pageScore = scorePage(page.content);
  let tokenBudget = maxTokens;

  // ---------- chunk extraction ----------

  const rawChunks = page.content
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter((c) => c.length > 80);

  const scoredChunks = rawChunks
    .map((chunk, idx) => ({
      chunk,
      idx,
      score: scoreChunk(chunk),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  let pageContext = "";
  let pageTokens = 0;

  for (const item of scoredChunks) {
    // expand with neighbor context (±1)
    const combined = [
      rawChunks[item.idx - 1],
      item.chunk,
      rawChunks[item.idx + 1],
    ]
      .filter(Boolean)
      .join("\n");

    const tokens = estimateTokens(combined);

    if (pageTokens + tokens > maxTokens || tokenBudget - tokens < 0) break;

    pageContext += combined + "\n\n";
    pageTokens += tokens;
    tokenBudget -= tokens;
  }

  if (!pageContext.trim()) return null;

  return {
    score: pageScore,
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
