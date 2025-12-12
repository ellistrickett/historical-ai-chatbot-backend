import {
  detectTopic,
  chooseWeighted,
  detectDialogueTree,
  getCurrentTime,
} from '../utils/chatUtils.js';
import { generateGeminiPersonaResponse } from './aiService.js';

/**
 * Generates a reply for the user based on the persona, dialogue tree, or AI.
 * Prioritizes dialogue trees, then topic detection, then AI generation.
 *
 * @param {string} userMessage - The user's message.
 * @param {Object} personaData - The full data for the persona.
 * @param {Object} currentTreeState - The current state of the dialogue tree, if any.
 * @param {Array} history - The chat history for context.
 * @returns {Promise<Object>} The generated reply, new state, mode, and timestamp.
 */
export async function generateBotReply(
  userMessage,
  personaData,
  currentTreeState,
  history
) {
  // Handle existing Dialogue Tree
  if (currentTreeState) {
    return handleTreeState(userMessage, currentTreeState, personaData);
  }

  // Check for New Dialogue Tree Trigger
  const newTree = detectDialogueTree(userMessage, personaData.dialogueTrees);
  if (newTree) {
    const firstStep = personaData.dialogueTrees[newTree.name].steps.start;
    return {
      reply: firstStep.bot,
      options: capitaliseOptions(firstStep.options),
      treeState: newTree,
      mode: 'tree_start',
      timestamp: getCurrentTime(),
    };
  }

  // Check for Topic Keyword Match
  const detectedTopic = detectTopic(userMessage, personaData.topics);
  if (detectedTopic) {
    const possibleResponses = personaData.responses[detectedTopic];
    const selected = chooseWeighted(possibleResponses);

    if (selected) {
      return {
        reply: selected.text,
        treeState: null,
        mode: 'topic_match',
        timestamp: getCurrentTime(),
      };
    }
  }

  // Fallback: AI Generation
  try {
    const aiReply = await generateGeminiPersonaResponse(
      personaData.persona,
      userMessage,
      history
    );
    return {
      reply: aiReply,
      treeState: null,
      mode: 'ai_fallback',
      timestamp: getCurrentTime(),
    };
  } catch (error) {
    console.error('AI Generation failed:', error);

    const fallbackOptions = personaData.responses.fallback || [
      { text: 'I am lost for words.' },
    ];
    const finalFallback = chooseWeighted(fallbackOptions);

    return {
      reply: finalFallback.text,
      treeState: null,
      mode: 'error_fallback',
      timestamp: getCurrentTime(),
    };
  }
}

/**
 * Handles the state of a dialogue tree.
 * Includes safety checks to prevent crashes if state is invalid.
 * @param {string} userText - The user's input text.
 * @param {Object} currentTreeState - The current state of the dialogue tree.
 * @param {Object} personaData - The full data for the persona.
 * @returns {Object} The response object containing the reply, options, and new tree state.
 */
function handleTreeState(userText, currentTreeState, personaData) {
  const { name, step } = currentTreeState;

  // SAFETY CHECK: Ensure the tree and step actually exist.
  // This prevents crashes if the client sends a stale state.
  const tree = personaData.dialogueTrees?.[name];
  const currentStepData = tree?.steps?.[step];

  if (!tree || !currentStepData) {
    console.warn(`Invalid tree state received: ${name}/${step}. Resetting tree.`);
    return {
      reply: "I seem to have lost my train of thought. What were we talking about?",
      options: null,
      treeState: null, // Reset state to exit tree mode
      mode: 'tree_broken_state',
      timestamp: getCurrentTime(),
    };
  }

  const lowerInput = userText.toLowerCase();
  let nextStepKey = null;

  // Check if input matches any options
  if (currentStepData.options) {
    const match = Object.keys(currentStepData.options).find((opt) =>
      lowerInput.includes(opt)
    );
    if (match) {
      nextStepKey = currentStepData.options[match].nextStep;
    }
  }

  // Use default next step if no option matched
  if (!nextStepKey && currentStepData.defaultNext) {
    nextStepKey = currentStepData.defaultNext;
  }

  // Move to next step
  if (nextStepKey) {
    const nextStepData = tree.steps[nextStepKey];

    // Safety check for next step existence
    if (!nextStepData) {
        console.error(`Missing next step definition: ${nextStepKey}`);
        return {
            reply: "...",
            options: null,
            treeState: null,
            mode: 'tree_error',
            timestamp: getCurrentTime()
        }
    }

    if (nextStepData.end) {
      return {
        reply: nextStepData.bot,
        options: null,
        treeState: null,
        mode: 'tree_end',
        timestamp: getCurrentTime(),
      };
    }

    return {
      reply: nextStepData.bot,
      options: capitaliseOptions(nextStepData.options),
      treeState: { name: name, step: nextStepKey },
      mode: 'tree_active',
      timestamp: getCurrentTime(),
    };
  }

  // Retry logic (stay on current step)
  return {
    reply: 'I did not understand. ' + currentStepData.bot,
    options: capitaliseOptions(currentStepData.options),
    treeState: currentTreeState,
    mode: 'tree_retry',
    timestamp: getCurrentTime(),
  };
}

/**
 * Capitalizes the first letter of each option key.
 * @param {Object} options - The options object where keys are the option text.
 * @returns {Array<string>|null} An array of capitalized option strings, or null if no options.
 */
function capitaliseOptions(options) {
  if (!options) return null;
  return Object.keys(options).map(
    (opt) => opt.charAt(0).toUpperCase() + opt.slice(1)
  );
}