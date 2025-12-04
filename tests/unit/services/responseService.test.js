import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../utils/chatUtils.js', () => ({
    detectTopic: jest.fn(),
    chooseWeighted: jest.fn(),
    detectDialogueTree: jest.fn(),
}));

jest.unstable_mockModule('../../../services/aiService.js', () => ({
    generatePersonaResponse: jest.fn(),
}));

// Dynamic imports
const { detectTopic, chooseWeighted, detectDialogueTree } = await import('../../../utils/chatUtils.js');
const { generatePersonaResponse } = await import('../../../services/aiService.js');
const { generateBotReply } = await import('../../../services/responseService.js');

describe('Response Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateBotReply', () => {
        it('returns topic response if matched', async () => {
            const personaData = {
                topics: { greeting: ['hello'] },
                responses: { greeting: [{ text: 'Hi there!', probability: 1 }] }
            };

            detectDialogueTree.mockReturnValue(null);
            detectTopic.mockReturnValue('greeting');
            chooseWeighted.mockReturnValue({ text: 'Hi there!' });

            const response = await generateBotReply('Hello', personaData, null);

            expect(response.reply).toBe('Hi there!');
            expect(response.mode).toBe('topic_match');
        });

        it('generates AI response if no topic matches', async () => {
            const personaData = {
                topics: {},
                responses: {},
                persona: { name: 'Bot' }
            };

            detectDialogueTree.mockReturnValue(null);
            detectTopic.mockReturnValue(null);
            generatePersonaResponse.mockResolvedValue('AI Response');

            const response = await generateBotReply('How are you?', personaData, null);

            expect(response.reply).toBe('AI Response');
            expect(response.mode).toBe('ai_fallback');
        });

        it('returns fallback response on AI error', async () => {
            const personaData = {
                topics: {},
                responses: { fallback: [{ text: 'Default' }] },
                persona: { name: 'Bot' }
            };

            detectDialogueTree.mockReturnValue(null);
            detectTopic.mockReturnValue(null);
            generatePersonaResponse.mockRejectedValue(new Error('AI Error'));
            chooseWeighted.mockReturnValue({ text: 'Default' });

            const response = await generateBotReply('Error', personaData, null);

            expect(response.reply).toBe('Default');
            expect(response.mode).toBe('error_fallback');
        });
    });
});
