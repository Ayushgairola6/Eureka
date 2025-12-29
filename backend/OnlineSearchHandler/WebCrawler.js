import { CheerioCrawler, MemoryStorage, Configuration } from "crawlee";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom"; // Much lighter than JSDOM
import TurndownService from "turndown";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const turndown = new TurndownService();

export async function GetDataFromSerper(query, user) {
  if (!query?.trim()) {
    throw new Error("Query parameter is required and cannot be empty");
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

export const ProcessForLLM = async (links, user, userQuery) => {
  const dataset = [];
  const turndown = new TurndownService({ headingStyle: "atx" });
  turndown.remove(["img", "iframe", "script", "style", "noscript"]);

  const config = new Configuration({
    storageClient: new MemoryStorage(),
  });

  const crawler = new CheerioCrawler(
    {
      minConcurrency: 1,
      maxConcurrency: 1, // Only 1 page at a time to save CPU for the recording
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

          const score = Math.min(
            100,
            Math.floor((wordCount / 10) * density * hasKeywords)
          );

          dataset.push({
            title: article.title,
            url: request.url,
            favicon: `https://www.google.com/s2/favicons?domain=${
              new URL(request.url).hostname
            }&sz=64`,
            markdown: markdown,
            score: score,
            estimatedTokens: Math.ceil(markdown.length / 4),
          });
        }

        // No manual cleanup needed for linkedom like JSDOM's window.close()
      },

      // failedRequestHandler: ({ request }) => {

      // },
    },
    config
  );

  await crawler.run(links);
  return dataset.filter((item) => item.estimatedTokens < 4000);
};

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
