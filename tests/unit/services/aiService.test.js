import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../config/geminiClient.js', () => ({
  generateAIContent: jest.fn(),
}));

// Dynamic imports
const { generateAIContent } = await import('../../../config/geminiClient.js');
const { generateSummaryTitle, generateGeminiPersonaResponse } = await import(
  '../../../services/aiService.js'
);

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSummaryTitle', () => {
    it('generates a title successfully', async () => {
      generateAIContent.mockResolvedValue('"Ancient Chat"');
      const messages = [{ role: 'user', text: 'Hello' }];

      const title = await generateSummaryTitle(messages);

      expect(generateAIContent).toHaveBeenCalled();
      expect(title).toBe('Ancient Chat');
    });

        it('returns a smart fallback title if AI generation fails', async () => {
      // 1. Setup: Mock the AI to fail
      generateAIContent.mockRejectedValue(new Error('AI Error'));
      
      // 2. Setup: Provide a user message (fallback relies on this)
      const messages = [{ role: 'user', text: 'Hello' }];

      const title = await generateSummaryTitle(messages);

      // 3. Assert: We expect the fallback string, NOT null
      expect(title).toBe('Conversation');
    });
  });

  describe('generateGeminiPersonaResponse', () => {
    it('generates a response successfully', async () => {
      generateAIContent.mockResolvedValue('I am Cleopatra.');

      const mockPersona = {
        name: 'Cleopatra',
        tone: 'Regal',
        traits: ['Queen'],
      };

      const response = await generateGeminiPersonaResponse(
        mockPersona,
        'Who are you?'
      );

      expect(generateAIContent).toHaveBeenCalledWith(
        expect.stringContaining('You are roleplaying as Cleopatra')
      );
      expect(response).toBe('I am Cleopatra.');
    });
  });
});
