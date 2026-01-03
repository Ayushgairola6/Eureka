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
import { HandleUserSessionHistory } from "../controllers/FeaturesController.js";
import { GlobalRequestRateLimit } from "../controllers/UserCreditLimitController.js";
Router.post(
  "/upload-pdf",
  VerifyToken,
  uploadFile.single("file"),
  FileUploadHandle
)
  .post("/ask-docs", GlobalRequestRateLimit, VerifyToken, GetPublicRecords)
  .delete("/user/private-docs/delete", VerifyToken, DeleteFileHandle)
  .post(
    "/privateDocs/ask-docs",
    GlobalRequestRateLimit,
    VerifyToken,
    GetPrivateDocResultss
  )
  .post(
    "/query/web-search",
    GlobalRequestRateLimit,
    VerifyToken,
    PostTypeWebSearch
  )
  .get(
    "/new-sseToken",
    GlobalRequestRateLimit,
    VerifyToken,
    GenerateSSEspecificTokens
  )
  .get(
    "/ask-pdf",
    GlobalRequestRateLimit,
    VerifySSETokens,
    FindMatchingResponse
  )
  .get(
    "/user/documents",
    GlobalRequestRateLimit,
    VerifyToken,
    GetPrivateUserDocs
  )
  .get(
    "/privateDocs/ask",
    GlobalRequestRateLimit,
    VerifySSETokens,
    QueryPersonalDocs
  )
  .get(
    "/user/web-search",
    GlobalRequestRateLimit,
    VerifySSETokens,
    WebSearchHandle
  )
  .post(
    "/method/synthesis",
    GlobalRequestRateLimit,
    VerifyToken,
    IdentifyRequestInputs
  )
  .post(
    "/user/session-history/",
    GlobalRequestRateLimit,
    VerifyToken,
    HandleUserSessionHistory
  );
