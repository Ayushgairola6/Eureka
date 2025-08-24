import { CreateChatRooms, GetRoomChatHistory, JoinARoom, GetDocumentChatHistory } from "../controllers/ChatRoomController.js";
import { VerifyToken } from '../Middlewares/AuthMiddleware.js';
import express from 'express';
export const ChatsRouter = express.Router();

ChatsRouter.post("/user/request/create-room", VerifyToken, CreateChatRooms)
    .post("/user/request/:joiningCode", VerifyToken, JoinARoom)
    .get("/user/chatrooms/:room_id", VerifyToken, GetRoomChatHistory)
    .get("/user/document/chat-history/:document_id", VerifyToken, GetDocumentChatHistory)