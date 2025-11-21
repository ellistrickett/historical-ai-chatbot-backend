import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatsFilePath = path.resolve(__dirname, '..', "previous-chats.json");

export function postResponseMessage(message, responseData) {
  
  const lower = message.toLowerCase();

  if (responseData && responseData.rules) {
    for (const rule of responseData.rules) {
      for (const keyword of rule.keywords) {
        if (lower.includes(keyword)) {
          return rule.response;
        }
      }
    }
  }

  return responseData?.default_response || "I don't understand.";
}

export function saveChat(newChatData) {
    try {
        let chats = [];
        if (fs.existsSync(chatsFilePath)) {
            const data = fs.readFileSync(chatsFilePath, "utf-8");
            chats = JSON.parse(data);
        }

        chats.unshift(newChatData);

        fs.writeFileSync(chatsFilePath, JSON.stringify(chats, null, 2), "utf-8");

    } catch (error) {
        console.error("Error saving chat to file:", error);
        throw new Error("Failed to save chat data.");
    }
}

export function getPreviousChats() {
    try {
        const data = fs.readFileSync(chatsFilePath, "utf-8");
        const chats = JSON.parse(data);
        return chats;
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error("Error reading or parsing chats.json:", error);
        return [];
    }
}

export function getChatById(chatId) {
    try {
        const chats = getPreviousChats(); 
        return chats.find(chat => chat.id === chatId);

    } catch (error) {
        console.error("Error finding chat by ID:", error);
        return undefined;
    }
}