import { FetchChatHistory } from "../CachingHandler/redisClient.js";
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
  .post("/chat-room/ask-doc", VerifyToken, QueryDocWithAntiNodeInChatRoom)
  .post("/user/chat-room/ask-web/", VerifyToken, QueryWebInAntiNodeChatRoom)
  .get(
    "/user/doc/misallaneous-history",
    VerifyToken,
    GetMisallaneousChatHistory
  )
  .get("/user/session-history/cache=true", VerifyToken, FetchChatHistory)
  .post("/chatroom/synthesis", VerifyToken, GetSyntheSizedResults)
  .post("/room/history/chats", VerifyToken, FetchMoreMessages);
