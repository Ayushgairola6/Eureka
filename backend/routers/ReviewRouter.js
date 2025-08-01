import { HandleDocumentAuthenticityFeedback, RecieveReviews } from "../controllers/FeedbackController.js";
import {VerifyToken} from '../Middlewares/AuthMiddleware.js';
import express from 'express';

export const ReviewRouter = express.Router();

ReviewRouter.post("/user/review-data",VerifyToken,RecieveReviews)
.post("/doc/authenticity",VerifyToken,HandleDocumentAuthenticityFeedback)

