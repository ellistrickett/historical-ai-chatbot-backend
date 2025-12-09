/**
 * Selects an item from a list based on weighted probability.
 * @param {Array<{probability: number}>} items - List of items with probability weights.
 * @returns {Object|null} The selected item or null if list is empty.
 */
export function chooseWeighted(items) {
  if (!items || items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.probability;
    if (random <= 0) {
      return item;
    }
  }
  return items[0];
}

/**
 * Detects if the user's text matches any predefined topics.
 * @param {string} userText - The user's input text.
 * @param {Object} topicsMap - A map of topics to keywords.
 * @returns {string|null} The detected topic key or null if no match.
 */
export function detectTopic(userText, topicsMap) {
  const lowerInput = userText.toLowerCase();

  for (const [topic, keywords] of Object.entries(topicsMap)) {
    if (
      keywords.some((keyword) => lowerInput.includes(keyword.toLowerCase()))
    ) {
      return topic;
    }
  }
  return null;
}

/**
 * Detects if the user's text triggers a dialogue tree.
 * @param {string} userText - The user's input text.
 * @param {Object} dialogueTrees - The available dialogue trees.
 * @returns {Object|null} The initial tree state object or null if no match.
 */
export function detectDialogueTree(userText, dialogueTrees) {
  const lowerInput = userText.toLowerCase();

  if (!dialogueTrees) return null;

  for (const [treeName, treeData] of Object.entries(dialogueTrees)) {
    if (
      treeData.triggers.some((trigger) => {
        const regex = new RegExp(`\\b${trigger}\\b`, 'i');
        return regex.test(lowerInput);
      })
    ) {
      return { name: treeName, step: 'start' };
    }
  }
  return null;
}
