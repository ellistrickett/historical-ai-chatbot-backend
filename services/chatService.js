
export function postResponseMessage(message) {
  const lower = userMessage.toLowerCase();

  for (const rule of responses.rules) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.response;
      }
    }
  }

  return responses.default_response;
}
