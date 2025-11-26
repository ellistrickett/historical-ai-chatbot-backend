import fs from "fs/promises";
import path from "path";

const chatsFilePath = path.join(process.cwd(), "previous-chats.json");

export function postResponseMessage(userMessage, personaData) {
  if (!personaData || !personaData.rules) {
    return "I am currently lost for words.";
  }

  const normalizedMessage = userMessage.toLowerCase().trim();

  const matchedRule = personaData.rules.find(rule => {
    return rule.keywords.some(keyword => {
      return normalizedMessage.includes(keyword.toLowerCase());
    });
  });

  return matchedRule ? matchedRule.response : (personaData.default_response || "I do not understand.");
}

export async function getPreviousChats() {
    try {
        await fs.access(chatsFilePath);
        const data = await fs.readFile(chatsFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        
        console.error("Error reading chats file:", error);
        throw new Error("Could not retrieve chat history.");
    }
}

export async function saveChat(newChatData) {
    try {
        const chats = await getPreviousChats();
        
        chats.unshift(newChatData);

        await fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2), "utf-8");
        return true;
    } catch (error) {
        console.error("Error saving chat:", error);
        throw new Error("Failed to save chat data.");
    }
}

export async function getChatById(chatId) {
    const chats = await getPreviousChats();
    return chats.find(chat => chat.id === chatId);
}