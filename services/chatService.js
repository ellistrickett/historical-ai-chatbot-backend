import { generateAIContent } from "../config/geminiClient.js";
import { readChatsFile, writeChatsFile } from "../repositories/chatRepository.js";
import { generateSummaryTitle, generatePersonaResponse } from "./aiService.js";

export async function postResponseMessage(userMessage, personaData, personaName) {
  if (!personaData?.rules) return "I am currently lost for words.";

  const normalizedMessage = userMessage.toLowerCase().trim();

  const matchedRule = personaData.rules.find(rule =>
    rule.keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()))
  );

  if (matchedRule) return matchedRule.response;

  try {
    return await generatePersonaResponse(personaName, userMessage);
  } catch (error) {
    return personaData.default_response || "I do not understand.";
  }
}

export async function getPreviousChats() {
  return await readChatsFile();
}

export async function saveChat(newChatData) {
  try {
    const chats = await readChatsFile();

    if (newChatData.messages?.length > 0) {
      const aiTitle = await generateSummaryTitle(newChatData.messages);
      if (aiTitle) newChatData.title = aiTitle;
    }

    chats.unshift(newChatData);
    await writeChatsFile(chats);
    return true;
  } catch (error) {
    console.error("Service Error saving chat:", error);
    throw error;
  }
}

export async function getChatById(chatId) {
  const chats = await readChatsFile();
  return chats.find(chat => chat.id === chatId);
}

export async function deleteChatById(chatId) {
  try {
    const chats = await readChatsFile();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    if (chats.length === updatedChats.length) return false;
    await writeChatsFile(updatedChats);

    return true;
  } catch (error) {
    console.error("Service Error deleting chat:", error);
    throw error;
  }
}