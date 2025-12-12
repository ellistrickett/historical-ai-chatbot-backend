import { generateBotReply } from '../services/chatResponseService.js';
import { getPersona } from '../services/personaService.js';
import { Message } from '../models/Chat.js';

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
 * @param {express.NextFunction} next - The next middleware function.
 */
export async function handleChatRequest(req, res, next) {
  try {
    const { message, personaName, treeState, history } = req.body;

    // Validation (Fail Fast)
    if (!personaName || typeof personaName !== 'string') {
      const error = new Error('Persona name is required and must be a string.');
      error.statusCode = 400;
      throw error;
    }

    if (!message || typeof message !== 'string') {
      const error = new Error('Message is required and must be a string.');
      error.statusCode = 400;
      throw error;
    }

    // Validate using Mongoose Model
    const msgInstance = new Message({ sender: 'user', text: message });
    const validationError = msgInstance.validateSync();
    if (validationError) {
      const error = new Error(validationError.message);
      error.statusCode = 400;
      throw error;
    }

    if (history && !Array.isArray(history)) {
      const error = new Error('History must be an array.');
      error.statusCode = 400;
      throw error;
    }

    // Check Persona Existence
    const currentPersonaData = getPersona(personaName);
    if (!currentPersonaData) {
      const error = new Error(`Persona '${personaName}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Generate Response
    const botResult = await generateBotReply(
      message,
      currentPersonaData,
      treeState,
      history
    );

    // Send Response
    res.json({
      reply: botResult.reply,
      treeState: botResult.treeState,
      mode: botResult.mode,
      options: botResult.options,
      timestamp: botResult.timestamp,
    });
  } catch (error) {
    next(error); 
  }
}