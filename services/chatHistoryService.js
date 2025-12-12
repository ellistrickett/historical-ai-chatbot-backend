import {
  readChatsFile,
  writeChatsFile,
} from '../repositories/chatHistoryRepository.js';
import { generateSummaryTitle } from './aiService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Retrieves chat summaries (id, title, personaName, date) with pagination.
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=8] - The number of items per page.
 * @returns {Promise<{chats: Array, hasMore: boolean, total: number}>} A promise that resolves to an object containing chat summaries and pagination metadata.
 */
export async function getChatSummaries(page = 1, limit = 8) {
  const chats = await readChatsFile();
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedChats = chats.slice(startIndex, endIndex).map((chat) => ({
    id: chat.id,
    title: chat.title,
    personaName: chat.personaName,
    date: chat.date,
  }));

  return {
    chats: paginatedChats,
    hasMore: endIndex < chats.length,
    total: chats.length
  };
}

/**
 * Retrieves a specific chat session by its ID.
 * @param {string} chatId - The ID of the chat to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the chat object or undefined if not found.
 */
export async function getChatById(chatId) {
  const chats = await readChatsFile();
  const chat = chats.find((c) => c.id === chatId);

  if (!chat) {
    // Throw error so Controller catches it
    const error = new Error('Chat not found');
    error.statusCode = 404; 
    throw error;
  }

  return chat;
}

/**
 * Saves a chat session (creates new or updates existing).
 * Generates an AI title if one is missing and there are messages.
 * @param {Object} chatData - The chat data to save (id, title, personaName, messages, etc.).
 * @returns {Promise<string>} A promise that resolves to the chat ID.
 * @throws {Error} If saving fails.
 */
export async function saveChat(chatData) {
  const chats = await readChatsFile();
  
  // Handle ID and Date for new chats
  if (!chatData.id) {
    chatData.id = uuidv4();
    chatData.date = new Date().toISOString();
  }

  // Generate AI Title if missing
  if (chatData.messages?.length > 0 && !chatData.title) {
    const aiTitle = await generateSummaryTitle(chatData.messages);
    chatData.title = aiTitle || 'Server Error: Could not generate AI title';
  }

  // Merge new data into old data to preserve fields
  if (existingIndex >= 0) {
    chats[existingIndex] = { 
      ...chats[existingIndex], 
      ...chatData 
    };
  } else {
    chats.unshift(chatData);
  }

  await writeChatsFile(chats);
  
  // Return the ID so the controller can send it back to client
  return chatData.id;
}

/**
 * Deletes a chat session by its ID.
 * @param {string} chatId - The ID of the chat to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 * @throws {Error} If deletion fails.
 */
export async function deleteChatById(chatId) {
  const chats = await readChatsFile();
  const updatedChats = chats.filter((chat) => chat.id !== chatId);

  if (chats.length === updatedChats.length) return false;

  await writeChatsFile(updatedChats);
  return true;
}
