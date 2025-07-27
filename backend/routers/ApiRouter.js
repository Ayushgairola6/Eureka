import express from 'express';
import { Generate_API_keys } from '../controllers/API_controller.js';
import { VerifyToken } from '../Middlewares/AuthMiddleware.js';

export const API_Router = express.Router();

API_Router.get("/get/api-key",VerifyToken,Generate_API_keys);