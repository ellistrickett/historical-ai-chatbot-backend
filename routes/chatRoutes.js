import express from 'express';
import { handleChatRequest } from '../controllers/responseController.js';
import {
    getChats,
    getSingleChat,
    createChat,
    deleteChat
} from '../controllers/chatHistoryController.js';

const router = express.Router();

// --- LIVE CHAT ENDPOINT ---
router.post('/chat', handleChatRequest);

// --- HISTORY ENDPOINTS ---
router.get('/chat/history', getChats);
router.post('/chat/history', createChat);
router.get('/chat/history/:chatId', getSingleChat);
router.delete('/chat/history/:chatId', deleteChat);

export default router;