import { CheerioCrawler, MemoryStorage, Configuration, log } from "crawlee";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom"; // Much lighter than JSDOM
import TurndownService from "turndown";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import axios from "axios";
import dotenv from "dotenv";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
dotenv.config();

const turndown = new TurndownService();

// serper query
export async function GetDataFromSerper(query, user) {
  if (!query?.trim()) {
    return { error: "Query parameter is required and cannot be empty" };
  }

  EmitEvent(user.user_id, "query_status", {
    message: "fetching_url",
    data: [`Searching for ${query}`],
  });

  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: query, num: 10 },
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
    console.error(error);
    return {
      error: "Error while processing web search",
      details: error?.response?.data?.message || error.message,
    };
  }
}

// filter the results into links and ready them for jina-reader

export function FilterUrlForExtraction(data, user) {
  const LinksToProcess = [];
  if (data?.organic && data.organic?.length > 0) {
    data.organic.forEach((obj) => {
      if (obj.link) {
        LinksToProcess.push(obj.link);
      }
    });
  }

  EmitEvent(user.user_id, "query_status", {
    message: "processing_links",
    data: LinksToProcess,
  });
  return LinksToProcess;
}

// scraping the data from web
export const ProcessForLLM = async (links, user, userQuery) => {
  const dataset = [];
  const turndown = new TurndownService({ headingStyle: "atx" });
  turndown.remove(["img", "iframe", "script", "style", "noscript"]);
  // const validLinks = links.filter(
  //   (link) => link.startsWith("http://") || link.startsWith("https://")
  // );
  const validLinks = filterResearchLinks(links);

  const config = new Configuration({
    storageClient: new MemoryStorage(),
  });

  log.setLevel(log.LEVELS.OFF);
  const crawler = new CheerioCrawler(
    {
      minConcurrency: 1,
      maxConcurrency: 5, // Only 1 page at a time to save CPU for the recording
      maxRequestRetries: 1, // Don't keep trying if it fails once
      requestHandlerTimeoutSecs: 15, // Keep it snappy

      async requestHandler({ request, body, $ }) {
        EmitEvent(user.user_id, "query_status", {
          message: "reading_links",
          data: [`Reading: ${new URL(request.url).hostname}`],
        });
        // 1. Quick Check: If Cheerio ($) sees the page is empty or tiny, skip immediately
        if (body.length < 500) return;

        const { document } = parseHTML(body);

        const reader = new Readability(document);
        const article = reader.parse();

        if (article && article.content) {
          const markdown = turndown.turndown(article.content);

          if (markdown.length < 200) return;
          const wordCount = article.textContent.split(/\s+/).length;

          const density = article.textContent.length / body.length;

          const queryLower = userQuery.toLowerCase();
          const hasKeywords = article.textContent
            .toLowerCase()
            .includes(queryLower)
            ? 1.5
            : 1;
          const hasProximity = article.textContent.match(
            new RegExp(`(${queryLower}).{0,50}(${queryLower})`, "g")
          )
            ? 1.2
            : 1;

          const finalScore = Math.floor(
            (wordCount / 10) * density * hasKeywords * hasProximity
          );

          const object = {
            title: article.title,
            url: request.url,
            favicon: `https://www.google.com/s2/favicons?domain=${
              new URL(request.url).hostname
            }&sz=64`,
            markdown: extractHighValueChunks(markdown, userQuery),
            score: finalScore,
            estimatedTokens: Math.ceil(markdown.length / 4),
          };
          await notifyMe(JSON.stringify(object));

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
function extractHighValueChunks(text, query, maxTokens = 3000) {
  const words = query.toLowerCase().split(" ");
  const chunks = text.split("\n\n"); // Break by paragraphs

  const scoredChunks = chunks.map((chunk) => {
    let score = 0;
    words.forEach((word) => {
      if (chunk.toLowerCase().includes(word)) score += 1;
    });
    return { chunk, score };
  });

  // Sort by relevance and take the top ones until we hit the token limit
  const bestChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 5); // Take top 5 relevant paragraphs

  return bestChunks.map((c) => c.chunk).join("\n\n");
}
