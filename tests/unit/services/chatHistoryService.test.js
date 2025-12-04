import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../repositories/chatRepository.js', () => ({
    readChatsFile: jest.fn(),
    writeChatsFile: jest.fn(),
}));

jest.unstable_mockModule('../../../services/aiService.js', () => ({
    generateSummaryTitle: jest.fn(),
}));

// Dynamic imports
const { readChatsFile, writeChatsFile } = await import('../../../repositories/chatRepository.js');
const { generateSummaryTitle } = await import('../../../services/aiService.js');
const { saveChat, deleteChatById } = await import('../../../services/chatHistoryService.js');

describe('Chat History Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
