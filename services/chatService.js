import fs from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const chatsFilePath = path.join(process.cwd(), "previous-chats.json");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- NEW HELPER FUNCTION ---
async function generateChatTitle(messages) {
  try {
    // 1. Convert message array to a readable string
    const conversationHistory = messages
      .map(msg => `${msg.name || msg.role}: ${msg.text}`)
      .join("\n");

    // 2. Create the prompt
    const prompt = `
      Analyze the following conversation and generate a short, descriptive title (max 6 words).
      The title should summarize the main topic.
      Do not use quotation marks in the output.
      
      Conversation:
      ${conversationHistory}
    `;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Cleanup: Remove quotes if Gemini added them despite instructions
    return title.replace(/^"|"$/g, '');

  } catch (error) {
    console.error("Error generating AI title:", error);
    return null; // Return null to fall back to default title
  }
}

export async function postResponseMessage(userMessage, personaData, personaName) {
  if (!personaData || !personaData.rules) {
    return "I am currently lost for words.";
  }

  const normalizedMessage = userMessage.toLowerCase().trim();

  const matchedRule = personaData.rules.find(rule => {
    return rule.keywords.some(keyword => {
      return normalizedMessage.includes(keyword.toLowerCase());
    });
  });

  if (matchedRule) {
    return matchedRule.response;
  }

  // Fallback to Gemini API
  try {
    const prompt = `You are ${personaName}. Respond to the following message in character: "${userMessage}". Keep your response concise and consistent with your historical persona.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return personaData.default_response || "I do not understand.";
  }
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

    // --- NEW LOGIC START ---
    // Only generate a title if there are messages to analyze
    if (newChatData.messages && newChatData.messages.length > 0) {
        console.log("Generating AI Title for chat...");
        const aiTitle = await generateChatTitle(newChatData.messages);
        
        // If successful, replace the default title
        if (aiTitle) {
            newChatData.title = aiTitle;
        }
    }
    // --- NEW LOGIC END ---

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