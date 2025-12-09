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
