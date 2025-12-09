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
    console.warn("Could not generate AI title");
    return null;
  }
}

/**
 * Generates a response from the AI persona.
 * 
 * @param {Object} persona - The persona object.
 * @param {string} userMessage - The user's message.
 * @param {Array} [history] - The chat history.
 * @returns {Promise<string>} The AI generated response.
 */
export async function generateGeminiPersonaResponse(persona, userMessage, history = []) {
  const traits = persona.traits ? persona.traits.join(", ") : "None";

  const prompt = `
      You are roleplaying as ${persona.name}.
      
      Your Character Profile:
      - Tone: ${persona.tone}
      - Key Traits: ${traits}
      ${history.length > 0 ? "\nRecent Conversation:\n" + history.map(msg => `${msg.name}: ${msg.text}`).join("\n") : ""}
      
      Task:
      Respond to the user's message below. 
      Stay strictly in character. Do not break the fourth wall. 
      Keep your response concise (under 3 sentences unless asked for a story).
      
      User Message: ${userMessage}
    `;

  return await generateAIContent(prompt);
}