import express from "express";
import {
  FileUploadHandle,
  FindMatchingResponse,
  GetPrivateUserDocs,
  QueryPersonalDocs,
} from "../controllers/fileControllers.js";
import { uploadFile } from "../multerconfig.js";
export const Router = express.Router();
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  GenerateSSEspecificTokens,
  VerifySSETokens,
} from "../Middlewares/StreamingMiddleware.js";
import { WebSearchHandle } from "../OnlineSearchHandler/WebSearchHandler.js";
Router.post(
  "/upload-pdf",
  VerifyToken,
  uploadFile.single("file"),
  FileUploadHandle
)
  .get("/new-sseToken", VerifyToken, GenerateSSEspecificTokens)
  .get("/ask-pdf", VerifySSETokens, FindMatchingResponse)
  .get("/user/documents", VerifyToken, GetPrivateUserDocs)
  .get("/privateDocs/ask", VerifySSETokens, QueryPersonalDocs)
  .get("/user/web-search", VerifySSETokens, WebSearchHandle);
