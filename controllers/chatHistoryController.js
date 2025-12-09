import {
  getPreviousChats,
  saveChat,
  getChatById,
  deleteChatById,
} from '../services/chatHistoryService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Retrieves all chat sessions.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export async function getChats(req, res) {
  try {
    const chats = await getPreviousChats();
    res.status(200).json(chats);
  } catch (error) {
    console.error('History Controller Error (getChats):', error);
    res.status(500).json({ message: 'Failed to retrieve chats.' });
  }
}

/**
 * Retrieves a specific chat session by ID.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export async function getSingleChat(req, res) {
  const { chatId } = req.params;

  try {
    const chat = await getChatById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error(`History Controller Error (getSingleChat ${chatId}):`, error);
    res.status(500).json({ message: 'Failed to retrieve chat.' });
  }
}

/**
 * Creates a new chat session.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export async function createChat(req, res) {
  const { title, personaName, messages } = req.body;

  if (!personaName || !messages) {
    return res
      .status(400)
      .json({ error: 'PersonaName and messages are required.' });
  }

  const newChatId = uuidv4();

  const newChatData = {
    id: newChatId,
    title: title,
    personaName: personaName,
    messages: messages,
    date: new Date().toISOString(),
  };

  try {
    await saveChat(newChatData);
    res.status(201).json({
      message: 'Chat saved successfully',
      chatId: newChatId,
    });
  } catch (error) {
    console.error('History Controller Error (createChat):', error);
    res.status(500).json({ message: 'Failed to save chat.' });
  }
}

/**
 * Deletes a chat session by ID.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
export async function deleteChat(req, res) {
  const { chatId } = req.params;

  try {
    const isDeleted = await deleteChatById(chatId);
    if (isDeleted) {
      res.status(200).json({ message: 'Chat deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    console.error('History Controller Error (deleteChat):', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
}
