import { readChatsFile, writeChatsFile } from "../repositories/chatRepository.js";
import { generateSummaryTitle } from "./aiService.js";

export async function getPreviousChats() {
  return await readChatsFile();
}

export async function getChatById(chatId) {
  const chats = await readChatsFile();
  return chats.find(chat => chat.id === chatId);
}

export async function saveChat(newChatData) {
  try {
    const chats = await readChatsFile();

    if (newChatData.messages?.length > 0 && !newChatData.title) {
      const aiTitle = await generateSummaryTitle(newChatData.messages);
      if (aiTitle) newChatData.title = aiTitle;
    }

    const existingIndex = chats.findIndex(c => c.id === newChatData.id);

    if (existingIndex >= 0) {
        chats[existingIndex] = newChatData;
    } else {
        chats.unshift(newChatData);
    }

    await writeChatsFile(chats);
    return true;

  } catch (error) {
    console.error("History Service Error saving chat:", error);
    throw error;
  }
}

export async function deleteChatById(chatId) {
  try {
    const chats = await readChatsFile();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    if (chats.length === updatedChats.length) return false;
    
    await writeChatsFile(updatedChats);
    return true;
  } catch (error) {
    console.error("History Service Error deleting chat:", error);
    throw error;
  }
}