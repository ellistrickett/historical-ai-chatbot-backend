import express from 'express';
import { handleChatRequest } from '../controllers/responseController.js';
import {
  getChats,
  getSingleChat,
  createChat,
  deleteChat,
} from '../controllers/chatHistoryController.js';

/**
 * Express router for chat-related endpoints.
 * @type {express.Router}
 */
const router = express.Router();

// --- LIVE CHAT ENDPOINT ---

/**
 * POST /api/chat
 * Handles a new chat message from the user.
 */
router.post('/chat', handleChatRequest);

// --- HISTORY ENDPOINTS ---

/**
 * GET /api/chat/history
 * Retrieves a list of all chat sessions.
 */
router.get('/chat/history', getChats);

/**
 * POST /api/chat/history
 * Creates a new chat session.
 */
router.post('/chat/history', createChat);

/**
 * GET /api/chat/history/:chatId
 * Retrieves a specific chat session by ID.
 */
router.get('/chat/history/:chatId', getSingleChat);

/**
 * DELETE /api/chat/history/:chatId
 * Deletes a specific chat session by ID.
 */
router.delete('/chat/history/:chatId', deleteChat);

export default router;
