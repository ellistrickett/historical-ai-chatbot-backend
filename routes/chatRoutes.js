import express from "express";
import { postChatMessage } from "../controllers/chatController";

const router = express.Router();

router.get("/");
router.post("/chat", postChatMessage);

export default router;