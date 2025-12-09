import { detectTopic, chooseWeighted, detectDialogueTree } from '../utils/chatUtils.js';
import { generateGeminiPersonaResponse } from './aiService.js';

/**
 * Generates a reply for the user based on the persona, dialogue tree, or AI.
 * 
 * @param {string} userMessage - The user's message.
 * @param {Object} personaData - The full data for the persona.
 * @param {Object} currentTreeState - The current state of the dialogue tree, if any.
 * @param {Array} history - The chat history for context.
 * @returns {Promise<Object>} The generated reply and new state.
 */
export async function generateBotReply(userMessage, personaData, currentTreeState, history) {

    if (currentTreeState) {
        return handleTreeState(userMessage, currentTreeState, personaData);
    }

    const newTree = detectDialogueTree(userMessage, personaData.dialogueTrees);
    if (newTree) {
        const firstStep = personaData.dialogueTrees[newTree.name].steps.start;
        return {
            reply: firstStep.bot,
            treeState: newTree,
            mode: "tree_start"
        };
    }

    const detectedTopic = detectTopic(userMessage, personaData.topics);

    if (detectedTopic) {
        const possibleResponses = personaData.responses[detectedTopic];
        const selected = chooseWeighted(possibleResponses);

        if (selected) {
            return {
                reply: selected.text,
                treeState: null,
                mode: "topic_match"
            };
        }
    }

    try {
        const aiReply = await generateGeminiPersonaResponse(personaData.persona, userMessage, history);
        return {
            reply: aiReply,
            treeState: null,
            mode: "ai_fallback"
        };
    } catch (error) {
        console.error("AI Generation failed:", error);

        const fallbackOptions = personaData.responses.fallback || [{ text: "I am lost for words." }];
        const finalFallback = chooseWeighted(fallbackOptions);

        return {
            reply: finalFallback.text,
            treeState: null,
            mode: "error_fallback"
        };
    }
}

function handleTreeState(userText, currentTreeState, personaData) {
    const { name, step } = currentTreeState;
    const tree = personaData.dialogueTrees[name];
    const currentStepData = tree.steps[step];
    const lowerInput = userText.toLowerCase();

    let nextStepKey = null;

    if (currentStepData.options) {
        const match = Object.keys(currentStepData.options).find(opt => lowerInput.includes(opt));
        if (match) {
            nextStepKey = currentStepData.options[match].nextStep;
        }
    }

    if (!nextStepKey && currentStepData.defaultNext) {
        nextStepKey = currentStepData.defaultNext;
    }

    if (nextStepKey) {
        const nextStepData = tree.steps[nextStepKey];

        if (nextStepData.end) {
            return {
                reply: nextStepData.bot,
                treeState: null,
                mode: "tree_end"
            };
        }

        return {
            reply: nextStepData.bot,
            treeState: { name: name, step: nextStepKey },
            mode: "tree_active"
        };
    }

    return {
        reply: "I did not understand. " + currentStepData.bot,
        treeState: currentTreeState,
        mode: "tree_retry"
    };
}