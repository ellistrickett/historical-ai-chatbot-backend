export function postResponseMessage(message, responseData) {
  
  const lower = message.toLowerCase();

  if (responseData && responseData.rules) {
    for (const rule of responseData.rules) {
      for (const keyword of rule.keywords) {
        if (lower.includes(keyword)) {
          return rule.response;
        }
      }
    }
  }

  return responseData?.default_response || "I don't understand.";
}