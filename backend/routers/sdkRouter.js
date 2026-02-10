import { ValidateApiKey } from "../Middlewares/ApiKeyValidator.js";
import {
  GetUserDocuments,
  QuerySpecificDocument,
  StoreDocument,
  SdkWebSearchHandler,
} from "../sdkFunctions/sdkcontroller.js";
import express from "express";
import { multerconfigForSdk } from "../multerconfig.js";
export const SdkRouter = express.Router();

SdkRouter.get("/user/private-documents", ValidateApiKey, GetUserDocuments)
  .post("/user/docs/query-private", ValidateApiKey, QuerySpecificDocument)
  .post(
    "/user/upload/private-document",
    ValidateApiKey,
    multerconfigForSdk.single("file"),
    StoreDocument
  )
  .post("/user/web-search/query", ValidateApiKey, SdkWebSearchHandler);
