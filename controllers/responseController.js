import { generateBotReply } from '../services/responseService.js';
import { getPersona } from '../services/personaService.js';

/**
 * Handles a chat request from the user.
 * Generates a response based on the persona, dialogue tree, or AI.
 * @param {express.Request} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.message - The user's message text.
 * @param {string} req.body.personaName - The name of the persona.
 * @param {Object} [req.body.treeState] - The current dialogue tree state.
 * @param {Array} [req.body.history] - The chat history.
 * @param {express.Response} res - The response object.
 */
export async function handleChatRequest(req, res) {
  const { message, personaName, treeState, history } = req.body;

  if (!personaName)
    return res.status(400).json({ error: 'Persona name is required' });
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message exceeds 2000 characters' });
  }

  const currentPersonaData = getPersona(personaName);
  if (!currentPersonaData) {
    return res
      .status(404)
      .json({ error: `Persona '${personaName}' not found.` });
  }

  try {
    const botResult = await generateBotReply(
      message,
      currentPersonaData,
      treeState,
      history
    );

    res.json({
      reply: botResult.reply,
      treeState: botResult.treeState,
      mode: botResult.mode,
      options: botResult.options,
      timestamp: botResult.timestamp,
    });
  } catch (error) {
    console.error('Response Controller Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
