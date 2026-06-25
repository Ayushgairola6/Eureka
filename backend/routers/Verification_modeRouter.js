import express from "express";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  VerificationModeSearchWeb,
  FinalAnalyzer,
  StoreResearchData,
} from "../VerificationModeFeatures/VerificationModeWebSearchHandler.js";
import {
  GetPendingResearch,
  RefreshArchive,
  ResumePendingThread,
  MarkResearchDone,
  Visualize,
  GetArtifacts,
} from "../VerificationModeFeatures/VerificationModeFeatures.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { FormattForLLM } from "../OnlineSearchHandler/WebCrawler.js";
import { CheckAndExpireThreadId } from "../VerificationModeFeatures/helpers.js";
import { HandleTTS } from "../controllers/Audio.controller.js";
// import { StoreRe } from ''
export const VerificationModeRouter = express.Router();

// webhook events from rag pipeline
const EVENT_MAP = {
  GENERATED_EMBEDDINGS: "understanding_query",     // embedding the user's prompt
  LINK_READ: "reading_source",           // opened a source URL
  PARSING_DOCUMENT: "reading_document",         // parsing PDF / CSV / txt
  ANALYZING_IMAGES: "analyzing_images",         // vision model running
  PAGE_READ: "source_processed",         // page fully chunked + ranked
  LINKS_DISCOVERED: "diving_deeper",            // found nested links, going deeper
  SCRAPE_COMPLETE: "research_complete",        // entire pipeline done
  ERROR_OCCURRED: "source_unavailable",       // something failed
  SEARCH_INITIALIZED: "started_reading",
  EXTRACTING_CONTENT: "extracting_content",
  CHUNKS_PROCESSED: "chunks_processed",
  SCORING_LINKS: "checking_compatibility",
  NODE_ADDED_TO_GRAPH: "research_stored",
  MAX_NODES_REACHED: "max_nodes"
};


VerificationModeRouter.post(
  "/query/verification-mode",
  VerifyToken,
  VerificationModeSearchWeb
)
  .post("/query/finalize", VerifyToken, FinalAnalyzer)
  .get("/fetch-research", VerifyToken, GetPendingResearch)
  .post("/research-continue", VerifyToken, ResumePendingThread)
  .get("/refresh-archive", VerifyToken, RefreshArchive)
  .put("/markdone", VerifyToken, MarkResearchDone)
  .post("/scraper-events", (req, res) => {
    const { message, link, user_id, MessageId } = req.body;

    const eventKey = EVENT_MAP[message];

    if (!eventKey) {
      // Unknown event — don't crash, just log and ack
      console.warn(`[scraper-webhook] Unknown event received: ${message}`);
      return res.status(200).json({ ok: true });
    }


    let displayData = [];

    if (message === "LINKS_DISCOVERED" && link?.includes("::")) {
      const [count, urlList] = link.split("::");
      const urls = urlList?.split(",").filter(Boolean) || [];
      displayData = [`Found ${count} relevant links`, ...urls.map(u => `↳ ${u}`)];

    } else if (link && link !== "no_link") {
      // Trim the URL to a readable hostname + path
      try {
        const u = new URL(link);
        displayData = [`${u.hostname}${u.pathname.slice(0, 60)}`];
      } catch {
        displayData = [link.slice(0, 100)];
      }
    }

    EmitEvent(user_id, "query_status", {
      MessageId,
      status: {
        message: eventKey,
        data: displayData,
      },
    });

    return res.status(200).json({ ok: true });
  })
  .post("/visualizer", VerifyToken, Visualize)
  .get("/artifacts", VerifyToken, GetArtifacts)
  //rsearch-webhhok endpoint
  .post("/research-results", async (req, res) => {
    const { event, thread_id, results, user_id, MessageId, query } = req.body;

    if (!event || !thread_id || !user_id || !MessageId || !query || typeof query !== "string") {
      notifyMe(
        "The research-done event returned no valid results via webhook",
        `event-${event}:thread_id-${thread_id}`
      );
    }

    res.json({ status: "ok" });

    // Parse formatted data upfront so urls/favicons are always in scope
    const FormattedResearchData = results ? FormattForLLM(results) : null;
    const urls = FormattedResearchData?.urls || [];
    const favicons = FormattedResearchData?.favicons || [];
    const FinalResults = FormattedResearchData?.FinalContent || [];

    // Base research_data shell — reused across branches
    const base_research_data = {
      sources: urls,
      favicons: favicons,
      details: null,
      queries: [query],
      isSynthesized: false,
    };

    try {
      if (!FormattedResearchData || FormattedResearchData.error || event === "Research.failed") {
        EmitEvent(user_id, "Research_Done", {
          message: event,
          MessageId: MessageId,
          research_data: base_research_data,
          status: "failed",
          direct_answer: null,
        });
        return;
      }

      if (event === "Research.success") {
        const research_data = {
          ...base_research_data,
          details: FinalResults,  // ResearchDetail[] — now includes type + meta per item
        };

        EmitEvent(user_id, "Research_Done", {
          message: event,
          MessageId: MessageId,
          research_data: research_data,
          status: "complete",
          direct_answer: null,
        });

        // Non-blocking cleanup + storage
        CheckAndExpireThreadId(thread_id, user_id).catch(err =>
          console.error("ThreadId expiry failed:", err)
        );

        await StoreResearchData(research_data, {
          MessageId,
          web_search_depth: "surface_web",
          user: { user_id },
          question: query,
        });
      }

    } catch (err) {
      console.error("Research webhook error:", err);
      EmitEvent(user_id, "Research_Done", {
        message: event,
        MessageId: MessageId,
        research_data: base_research_data,
        status: "failed",
        direct_answer: null,
      });
    }
  })

  .post("tts", VerifyToken, HandleTTS)

// Find the full text of the 2026 US Supreme Court ruling on AI‑generated evidence admissibility.Extract the dissenting opinion's key arguments and list all cited prior cases (with their docket numbers).