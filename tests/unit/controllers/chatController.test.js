import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../services/chatService.js', () => ({
    postResponseMessage: jest.fn(),
    getPreviousChats: jest.fn(),
    saveChat: jest.fn(),
    getChatById: jest.fn(),
    deleteChatById: jest.fn(),
}));

jest.unstable_mockModule('../../../services/personaService.js', () => ({
    getPersona: jest.fn(),
}));

// Dynamic imports
const { postResponseMessage, getPreviousChats, saveChat, deleteChatById, getChatById } = await import('../../../services/chatService.js');
const { getPersona } = await import('../../../services/personaService.js');
const { postChatMessage, getChats, saveChatRoute, getSingleChat, deleteChatRoute } = await import('../../../controllers/chatController.js');

describe('Chat Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('postChatMessage', () => {
        it('returns 400 if personaName is missing', async () => {
            req.body = { message: 'Hi' };
            await postChatMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'persona name is required' });
        });

        it('returns 404 if persona not found', async () => {
            req.body = { message: 'Hi', personaName: 'Unknown' };
            getPersona.mockReturnValue(null);

            await postChatMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('returns reply on success', async () => {
            req.body = { message: 'Hi', personaName: 'Cleopatra' };
            getPersona.mockReturnValue({ name: 'Cleopatra' });
            postResponseMessage.mockResolvedValue('Hello');

            await postChatMessage(req, res);
            expect(res.json).toHaveBeenCalledWith({ reply: 'Hello' });
        });
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

    describe('saveChatRoute', () => {
        it('saves chat successfully', async () => {
            req.body = { title: 'T', personaName: 'P', messages: [] };
            saveChat.mockResolvedValue(true);

            await saveChatRoute(req, res);
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

    describe('deleteChatRoute', () => {
        it('deletes chat successfully', async () => {
            req.params = { chatId: '123' };
            deleteChatById.mockResolvedValue(true);

            await deleteChatRoute(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Chat deleted successfully' });
        });

        it('returns 404 if chat not found', async () => {
            req.params = { chatId: '999' };
            deleteChatById.mockResolvedValue(false);

            await deleteChatRoute(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Chat not found' });
        });
    });
});
