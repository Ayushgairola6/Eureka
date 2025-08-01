import { ValidateApiKey } from '../Middlewares/ApiKeyValidator.js';
import { GetUserDocuments, QuerySpecificDocument, StoreDocument } from '../sdkFunctions/sdkcontroller.js';
import express from 'express';
export const SdkRouter = express.Router();

SdkRouter.get("/user/private-documents", ValidateApiKey, GetUserDocuments)
    .post("/user/docs/query-private", ValidateApiKey, QuerySpecificDocument)
    .post("/user/upload/private-document", ValidateApiKey, StoreDocument)


