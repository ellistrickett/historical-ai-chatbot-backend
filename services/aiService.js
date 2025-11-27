import { generateAIContent } from "../config/geminiClient.js";

export async function generateSummaryTitle(messages) {
  try {
    const conversationHistory = messages
      .map(msg => `${msg.name || msg.role}: ${msg.text}`)
      .join("\n");

    const prompt = `
      Analyze the following conversation and generate a short, descriptive title (max 6 words).
      The title should summarize the main topic.
      Do not use quotation marks.
      
      Conversation:
      ${conversationHistory}
    `;

    const text = await generateAIContent(prompt);
    return text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.warn("Could not generate AI title, using default.");
    return null;
  }
}

export async function generatePersonaResponse(personaName, userMessage) {
    const prompt = `You are ${personaName}. Respond to the following message in character: "${userMessage}". Keep your response concise and consistent with your historical persona.`;
    
    return await generateAIContent(prompt);
}