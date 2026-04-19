import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  CreateSubscription,
  GetPaymentStatus,
} from "../PaymentHandler/DodoPayments.js";
import express from "express";
export const PaymentsRouter = express.Router();

PaymentsRouter.post(
  "/create-subscription",
  VerifyToken,
  CreateSubscription
).post("/payment-status", VerifyToken, GetPaymentStatus);

// PaymentsRouter.
