import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../services/chatHistoryService.js', () => ({
    getPreviousChats: jest.fn(),
    saveChat: jest.fn(),
    getChatById: jest.fn(),
    deleteChatById: jest.fn(),
}));

// Dynamic imports
const { getPreviousChats, saveChat, deleteChatById, getChatById } = await import('../../../services/chatHistoryService.js');
const { getChats, createChat, getSingleChat, deleteChat } = await import('../../../controllers/chatHistoryController.js');

describe('Chat History Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getChats', () => {
        it('returns chats successfully', async () => {
            const mockChats = [{ id: 1 }];
            getPreviousChats.mockResolvedValue(mockChats);

            await getChats(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockChats);
        });
    });

    describe('createChat', () => {
        it('saves chat successfully', async () => {
            req.body = { title: 'T', personaName: 'P', messages: [] };
            saveChat.mockResolvedValue(true);

            await createChat(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat saved successfully' }));
        });
    });

    describe('getSingleChat', () => {
        it('returns chat if found', async () => {
            req.params = { chatId: '123' };
            const mockChat = { id: '123', title: 'Test' };
            getChatById.mockResolvedValue(mockChat);

            await getSingleChat(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockChat);
        });

        it('returns 404 if chat not found', async () => {
            req.params = { chatId: '999' };
            getChatById.mockResolvedValue(null);

            await getSingleChat(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Chat not found.' });
        });
    });

    describe('deleteChat', () => {
        it('deletes chat successfully', async () => {
            req.params = { chatId: '123' };
            deleteChatById.mockResolvedValue(true);

            await deleteChat(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Chat deleted successfully' });
        });

        it('returns 404 if chat not found', async () => {
            req.params = { chatId: '999' };
            deleteChatById.mockResolvedValue(false);

            await deleteChat(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Chat not found' });
        });
    });
});
