import express from "express";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  VerificationModeSearchWeb,
  FinalAnalyzer,
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
export const VerificationModeRouter = express.Router();

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
  .post("/source/read/apify", (req, res) => {
    const { message, link, user_id, MessageId } = req.body;

    const event =
      message === "LINK_READ"
        ? "reading_links"
        : message === "PAGE_READ"
        ? "Cleaning_Context"
        : message === "SCRAPE_COMPLETE"
        ? "Done_Scraping"
        : message === "ERROR_OCCURRED"
        ? "Unable_to_read_link"
        : "Unknown_Event";

    EmitEvent(user_id, "query_status", {
      MessageId,
      status: {
        message: event,
        data: [`Reading: ${link}`],
      },
    });

    return res.status(200).json({ ok: true });
  })
  .post("/visualizer", VerifyToken, Visualize)
  .get("/artifacts", VerifyToken, GetArtifacts);
