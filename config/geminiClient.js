import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing in .env file');
    throw new Error('API Key missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

export const generateAIContent = async (prompt) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
