import { ValidateApiKey } from '../Middlewares/ApiKeyValidator.js';
import { GetUserDocuments, QuerySpecificDocument, StoreDocument } from '../sdkFunctions/sdkcontroller.js';
import express from 'express';
import { uploadFile } from '../multerconfig.js';
export const SdkRouter = express.Router();

SdkRouter.get("/user/private-documents", ValidateApiKey, GetUserDocuments)
    .post("/user/docs/query-private", ValidateApiKey, QuerySpecificDocument)
    .post("/user/upload/private-document",ValidateApiKey,uploadFile.single("file"), StoreDocument)


