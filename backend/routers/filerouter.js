import express from 'express';
import { FileUploadHandle, FindMatchingResponse } from '../controllers/fileControllers.js';
import { uploadFile } from '../multerconfig.js';
export const Router = express.Router();
import { VerifyToken } from '../Middlewares/AuthMiddleware.js';

Router.post("/upload-pdf", VerifyToken, uploadFile.single("file"), FileUploadHandle)
    .post("/ask-pdf", VerifyToken, FindMatchingResponse)