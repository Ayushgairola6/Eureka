import express from "express";
import {
  FileUploadHandle,
  GetPrivateUserDocs,
  PostTypeWebSearch,
  GetPublicRecords,
  GetPrivateDocResultss,
  DeleteFileHandle,
} from "../controllers/fileControllers.js";
import {
  FindMatchingResponse,
  QueryPersonalDocs,
} from "../SSeHandler/SseHandlers.js";
import { uploadFile } from "../multerconfig.js";
export const Router = express.Router();
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  GenerateSSEspecificTokens,
  VerifySSETokens,
} from "../Middlewares/StreamingMiddleware.js";
import { WebSearchHandle } from "../OnlineSearchHandler/WebSearchHandler.js";
import { IdentifyRequestInputs } from "../Synthesis/Identifier.js";
Router.post(
  "/upload-pdf",
  VerifyToken,
  uploadFile.single("file"),
  FileUploadHandle
)
  .post("/ask-docs", VerifyToken, GetPublicRecords)
  .delete("/user/private-docs/delete", VerifyToken, DeleteFileHandle)
  .post("/privateDocs/ask-docs", VerifyToken, GetPrivateDocResultss)
  .post("/query/web-search", VerifyToken, PostTypeWebSearch)
  .get("/new-sseToken", VerifyToken, GenerateSSEspecificTokens)
  .get("/ask-pdf", VerifySSETokens, FindMatchingResponse)
  .get("/user/documents", VerifyToken, GetPrivateUserDocs)
  .get("/privateDocs/ask", VerifySSETokens, QueryPersonalDocs)
  .get("/user/web-search", VerifySSETokens, WebSearchHandle)
  .post("/method/synthesis", VerifyToken, IdentifyRequestInputs)
