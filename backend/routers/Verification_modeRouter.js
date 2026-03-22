import express from "express";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  VerificationModeSearchWeb,
  FinalAnalyzer,
} from "../VerificationModeFeatures/VerificationModeWebSearchHandler.js";
import { GetPendingResearch } from "../VerificationModeFeatures/VerificationModeFeatures.js";
export const VerificationModeRouter = express.Router();

VerificationModeRouter.post(
  "/query/verification-mode",
  VerifyToken,
  VerificationModeSearchWeb
)
  .post("/query/finalize", VerifyToken, FinalAnalyzer)
  .get("/fetch-research", VerifyToken, GetPendingResearch);
