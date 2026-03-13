import express from "express";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  VerificationModeSearchWeb,
  FinalAnalyzer,
} from "../VerificationModeFeatures/VerificationModeWebSearchHandler.js";
export const VerificationModeRouter = express.Router();

VerificationModeRouter.post(
  "/query/verification-mode",
  VerifyToken,
  VerificationModeSearchWeb
).post("/query/finalize", VerifyToken, FinalAnalyzer);
