import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import { CreateSubscirption } from "../PaymentHandler/DodoPayments.js";
import express from "express";
export const PaymentsRouter = express.Router();

PaymentsRouter.post("/create-subscription", CreateSubscirption);

// PaymentsRouter.
