import { FetchChatHistory } from "../controllers/FeaturesController.js";
import {
  CreateChatRooms,
  GetRoomChatHistory,
  JoinARoom,
  GetDocumentChatHistory,
  GetMisallaneousChatHistory,
  QueryDocWithAntiNodeInChatRoom,
  QueryWebInAntiNodeChatRoom,
  GetSyntheSizedResults,
  FetchMoreMessages,
} from "../controllers/ChatRoomController.js";
import { GlobalRequestRateLimit } from "../controllers/UserCreditLimitController.js";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import express from "express";
export const ChatsRouter = express.Router();

ChatsRouter.post("/user/request/create-room", VerifyToken, CreateChatRooms)
  .post("/user/request/:joiningCode", VerifyToken, JoinARoom)
  .get("/user/chatrooms/:room_id", VerifyToken, GetRoomChatHistory)
  .get(
    "/user/document/chat-history/:document_id",
    VerifyToken,
    GetDocumentChatHistory
  )
  .post(
    "/chat-room/ask-doc",
    GlobalRequestRateLimit,
    VerifyToken,
    QueryDocWithAntiNodeInChatRoom
  )
  .post(
    "/user/chat-room/ask-web/",
    GlobalRequestRateLimit,
    VerifyToken,
    QueryWebInAntiNodeChatRoom
  )
  .get(
    "/user/doc/misallaneous-history",
    VerifyToken,
    GetMisallaneousChatHistory
  )
  .get("/user/session-history/cache=true", VerifyToken, FetchChatHistory)
  .post(
    "/chatroom/synthesis",
    GlobalRequestRateLimit,
    VerifyToken,
    GetSyntheSizedResults
  )
  .post("/room/history/chats", VerifyToken, FetchMoreMessages);
