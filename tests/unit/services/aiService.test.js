import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../config/geminiClient.js', () => ({
    generateAIContent: jest.fn(),
}));

// Dynamic imports
const { generateAIContent } = await import('../../../config/geminiClient.js');
const { generateSummaryTitle, generatePersonaResponse } = await import('../../../services/aiService.js');

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

        it('handles errors gracefully', async () => {
            generateAIContent.mockRejectedValue(new Error('AI Error'));
            const messages = [{ role: 'user', text: 'Hello' }];

            const title = await generateSummaryTitle(messages);

            expect(title).toBeNull();
        });
    });

    describe('generatePersonaResponse', () => {
        it('generates a response successfully', async () => {
            generateAIContent.mockResolvedValue('I am Cleopatra.');

            const response = await generatePersonaResponse('Cleopatra', 'Who are you?');

            expect(generateAIContent).toHaveBeenCalledWith(expect.stringContaining('You are Cleopatra'));
            expect(response).toBe('I am Cleopatra.');
        });
    });
});
