import express from "express";
import { postChatMessage, getChats, saveChatRoute, getSingleChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", postChatMessage);
router.get("/previous-chat", getChats);
router.post("/chat/save", saveChatRoute);
router.get("/chat/:chatId", getSingleChat); 

export default router;