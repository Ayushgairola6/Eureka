import express from "express";
import {
  DriveConnector,
  StatusCheckDriveConnector,
} from "../Connectors/DriveConnector.js";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
export const ConnectorRouter = express.Router();

ConnectorRouter.get(
  "/connector-status",
  VerifyToken,
  StatusCheckDriveConnector
).get("/auth/google/drive/callback", VerifyToken, DriveConnector);
