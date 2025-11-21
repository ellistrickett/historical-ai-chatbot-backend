import { postResponseMessage, getPreviousChats, saveChat, getChatById } from "../services/chatService.js";

export function postChatMessage(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const responseData = req.app.locals.responses;

  const reply = postResponseMessage(message, responseData);

  res.json({ reply });

}

export function getChats(req, res) {
    try {
        const chats = getPreviousChats();

        res.status(200).json(chats);

    } catch (error) {
        console.error('Error in getChats controller:', error);
        res.status(500).json({ 
            message: 'An internal server error occurred while retrieving chats.' 
        });
    }
}

export function saveChatRoute(req, res) {
    const { title, personaId, messages } = req.body;

    if (!title || !personaId || !messages) {
        return res.status(400).json({ error: "Title, personaId, and messages are required." });
    }

    const newChatId = `c${Date.now()}`;
    
    const newChatData = {
        id: newChatId,
        title: title,
        personaId: personaId,
        messages: messages,
        date: new Date().toISOString()
    };

    try {
        saveChat(newChatData);
        res.status(201).json({ 
            message: "Chat saved successfully", 
            chatId: newChatId 
        });

    } catch (error) {
        console.error('Error saving chat:', error);
        res.status(500).json({ 
            message: 'An internal server error occurred while saving the chat.' 
        });
    }
}

export function getSingleChat(req, res) {
    const { chatId } = req.params;

    try {
        const chat = getChatById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        res.status(200).json(chat);

    } catch (error) {
        console.error(`Error in getSingleChat controller for ID ${chatId}:`, error);
        res.status(500).json({ 
            message: 'An internal server error occurred while retrieving the chat.' 
        });
    }
}
