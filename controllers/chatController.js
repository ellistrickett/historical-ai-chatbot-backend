import { postResponseMessage, getPreviousChats, saveChat, getChatById } from "../services/chatService.js";
import { getPersona } from '../services/personaService.js';

export function postChatMessage(req, res) {
    const { message, personaName } = req.body;

    if (!personaName) {
        return res.status(400).json({ error: "persona name is required" });
    }

    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    const currentPersonaData = getPersona(personaName);

    if (!currentPersonaData) {
        return res.status(404).json({ 
            error: `Persona '${personaName}' not found.` 
        });
    }

    try {
        const reply = postResponseMessage(message, currentPersonaData);
        res.json({ reply });
      
    } catch (error) {
        console.error("Service error:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
}

export async function getChats(req, res) {
    try {
        const chats = await getPreviousChats();

        res.status(200).json(chats);

    } catch (error) {
        console.error('Error in getChats controller:', error);
        res.status(500).json({ 
            message: 'An internal server error occurred while retrieving chats.' 
        });
    }
}

export async function saveChatRoute(req, res) {
    const { title, personaName, messages } = req.body;

    if (!title || !personaName || !messages) {
        return res.status(400).json({ error: "Title, personaName, and messages are required." });
    }

    console.log(title, personaName, messages);

    const newChatId = `c${Date.now()}`;
    
    const newChatData = {
        id: newChatId,
        title: title,
        personaName: personaName,
        messages: messages,
        date: new Date().toISOString()
    };

    try {
        await saveChat(newChatData);
        
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

export async function getSingleChat(req, res) {
    const { chatId } = req.params;

    try {
        const chat = await getChatById(chatId);

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