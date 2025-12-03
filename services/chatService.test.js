import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../config/geminiClient.js', () => ({
    generateAIContent: jest.fn(),
}));
jest.unstable_mockModule('../repositories/chatRepository.js', () => ({
    readChatsFile: jest.fn(),
    writeChatsFile: jest.fn(),
}));
jest.unstable_mockModule('./aiService.js', () => ({
    generateSummaryTitle: jest.fn(),
    generatePersonaResponse: jest.fn(),
}));

// Dynamic imports
const { readChatsFile, writeChatsFile } = await import('../repositories/chatRepository.js');
const { generatePersonaResponse, generateSummaryTitle } = await import('./aiService.js');
const { postResponseMessage, saveChat, deleteChatById } = await import('./chatService.js');

describe('Chat Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('postResponseMessage', () => {
        it('returns predefined rule response if matched', async () => {
            const personaData = {
                rules: [{ keywords: ['hello'], response: 'Hi there!' }]
            };
            const response = await postResponseMessage('Hello', personaData, 'Bot');
            expect(response).toBe('Hi there!');
        });

        it('generates AI response if no rule matches', async () => {
            const personaData = { rules: [] };
            generatePersonaResponse.mockResolvedValue('AI Response');

            const response = await postResponseMessage('How are you?', personaData, 'Bot');
            expect(response).toBe('AI Response');
        });

        it('returns default response on AI error', async () => {
            const personaData = { rules: [], default_response: 'Default' };
            generatePersonaResponse.mockRejectedValue(new Error('AI Error'));

            const response = await postResponseMessage('Error', personaData, 'Bot');
            expect(response).toBe('Default');
        });
    });

    describe('saveChat', () => {
        it('saves a new chat with generated title', async () => {
            readChatsFile.mockResolvedValue([]);
            generateSummaryTitle.mockResolvedValue('New Title');

            const newChat = { messages: [{ text: 'Hi' }] };
            await saveChat(newChat);

            expect(writeChatsFile).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ title: 'New Title' })
            ]));
        });
    });

    describe('deleteChatById', () => {
        it('deletes a chat successfully', async () => {
            readChatsFile.mockResolvedValue([{ id: '1' }, { id: '2' }]);

            const result = await deleteChatById('1');

            expect(result).toBe(true);
            expect(writeChatsFile).toHaveBeenCalledWith([{ id: '2' }]);
        });

        it('returns false if chat not found', async () => {
            readChatsFile.mockResolvedValue([{ id: '1' }]);

            const result = await deleteChatById('999');

            expect(result).toBe(false);
            expect(writeChatsFile).not.toHaveBeenCalled();
        });
    });
});
