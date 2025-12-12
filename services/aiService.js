import { generateAIContent } from '../config/geminiClient.js';

/**
 * Generates a short summary title for a conversation using AI.
 * @param {Array} messages - The array of chat messages.
 * @returns {Promise<string|null>} The generated title or null if generation fails.
 */
export async function generateSummaryTitle(messages) {
  try {
    // For long conversations, use the "Bookends" strategy (First 3 + Last 2)
    // to capture the introduction and conclusion without exceeding token limits.
    if (messages.length > 5) {
      relevantMessages = [
        ...messages.slice(0, 3),
        ...messages.slice(-2)
      ];
    }

    const conversationText = relevantMessages
      .map((msg) => `${msg.name || msg.role}: ${msg.text}`)
      .join('\n');

    const prompt = `
      Analyze the following conversation and generate a short, descriptive title (max 6 words).
      The title should summarize the main topic established at the start.
      Do not use quotation marks.
      
      Conversation:
      ${conversationText}
    `;

    const text = await generateAIContent(prompt);
    
    // If AI returns empty/garbage, throw so we hit the fallback
    if (!text || text.trim().length === 0) throw new Error("Empty AI response");

    return text.trim().replace(/^"|"$/g, '');

  } catch (error) {
    return generateSmartFallback(messages);
  }
}

/**
 * Helper: Generates a title by truncating the first user message.
 * Used when AI is unavailable.
 */
function generateSmartFallback(messages) {
  // Find the first message from the 'user'
  const firstUserMsg = messages.find(m => m.sender === 'user' || m.role === 'user');

  // If no user message (e.g. system only), default to generic
  if (!firstUserMsg || !firstUserMsg.text) {
    return 'New Conversation';
  }

  // Clean text (remove newlines and excessive spaces)
  const cleanText = firstUserMsg.text.replace(/\s+/g, ' ').trim();

  // Return specific hardcoded titles for very short greetings
  const lower = cleanText.toLowerCase();
  const genericGreetings = [
    "hello",
    "hi",
    "greetings",
    "hail",
    "good day",
    "speak",
    "presence"
  ];

  if (genericGreetings.includes(lower)) {
    return 'Conversation';
  }

  // Truncate logic: Take first 30 chars or first 5 words
  if (cleanText.length <= 30) return cleanText;

  return cleanText.substring(0, 30).trim() + '...';
}
/**
 * Generates a response from the AI persona.
 * Includes security measures against Prompt Injection.
 *
 * @param {Object} persona - The persona object.
 * @param {string} userMessage - The user's message.
 * @param {Array} [history] - The chat history.
 * @returns {Promise<string>} The AI generated response.
 */
export async function generateGeminiPersonaResponse(
  persona,
  userMessage,
  history = []
) {
  const traits = persona.traits ? persona.traits.join(', ') : 'None';

  // DEFENSIVE CODING: Slice to last 15 messages.
  // Even if frontend only sends 4, this prevents crashes if that logic changes later.
  const recentHistory = history.slice(-15)
    .map((msg) => `${msg.name}: ${msg.text}`)
    .join('\n');

  // SECURITY: Use XML-style tags (<user_input>) to separate Data from Instructions.
  // This prevents users from overriding the persona with "Ignore previous instructions".
  const prompt = `
    You are roleplaying as ${persona.name}.
    
    SYSTEM INSTRUCTIONS:
    - Tone: ${persona.tone}
    - Key Traits: ${traits}
    - Stay strictly in character. Do not break the fourth wall.
    - Keep your response concise (under 3 sentences unless asked for a story).
    
    CONTEXT (Recent Conversation):
    ${recentHistory}
    
    TASK:
    Respond to the message inside the <user_input> tags below.
    
    <user_input>
    ${userMessage}
    </user_input>
  `;

  return await generateAIContent(prompt);
}
