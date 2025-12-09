import {
  readChatsFile,
  writeChatsFile,
} from '../repositories/chatHistoryRepository.js';
import { generateSummaryTitle } from './aiService.js';

/**
 * Retrieves all previous chat sessions.
 * @returns {Promise<Array>} A promise that resolves to an array of chat objects.
 */
export async function getPreviousChats() {
  return await readChatsFile();
}

/**
 * Retrieves a specific chat session by its ID.
 * @param {string} chatId - The ID of the chat to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the chat object or undefined if not found.
 */
export async function getChatById(chatId) {
  const chats = await readChatsFile();
  return chats.find((chat) => chat.id === chatId);
}

/**
 * Saves a chat session (creates new or updates existing).
 * Generates an AI title if one is missing and there are messages.
 * @param {Object} newChatData - The chat data to save.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If saving fails.
 */
export async function saveChat(newChatData) {
  try {
    const chats = await readChatsFile();

    if (newChatData.messages?.length > 0 && !newChatData.title) {
      const aiTitle = await generateSummaryTitle(newChatData.messages);
      if (aiTitle) {
        newChatData.title = aiTitle;
      } else {
        newChatData.title = 'Server Error: Could not generate AI title';
      }
    }

    const existingIndex = chats.findIndex((c) => c.id === newChatData.id);

    if (existingIndex >= 0) {
      chats[existingIndex] = newChatData;
    } else {
      chats.unshift(newChatData);
    }

    await writeChatsFile(chats);
    return true;
  } catch (error) {
    console.error('History Service Error saving chat:', error);
    throw error;
  }
}

/**
 * Deletes a chat session by its ID.
 * @param {string} chatId - The ID of the chat to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 * @throws {Error} If deletion fails.
 */
export async function deleteChatById(chatId) {
  try {
    const chats = await readChatsFile();
    const updatedChats = chats.filter((chat) => chat.id !== chatId);

    if (chats.length === updatedChats.length) return false;

    await writeChatsFile(updatedChats);
    return true;
  } catch (error) {
    console.error('History Service Error deleting chat:', error);
    throw error;
  }
}
