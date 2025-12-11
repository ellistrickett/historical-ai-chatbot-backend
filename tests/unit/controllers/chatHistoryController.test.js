import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../services/chatHistoryService.js', () => ({
  getChatSummaries: jest.fn(),
  saveChat: jest.fn(),
  getChatById: jest.fn(),
  deleteChatById: jest.fn(),
}));

// Dynamic imports
const { getChatSummaries, saveChat, deleteChatById, getChatById } =
  await import('../../../services/chatHistoryService.js');
const { getChats, createChat, getSingleChat, deleteChat } = await import(
  '../../../controllers/chatHistoryController.js'
);

describe('Chat History Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getChats', () => {
    it('returns chats successfully', async () => {
      const mockChats = [{ id: 1 }];
      getChatSummaries.mockResolvedValue(mockChats);

      await getChats(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChats);
    });
  });

  describe('createChat', () => {
    it('saves chat successfully', async () => {
      req.body = { title: 'T', personaName: 'P', messages: [] };
      saveChat.mockResolvedValue('new-chat-id');

      await createChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Chat saved successfully' })
      );
    });
  });

  describe('getSingleChat', () => {
    it('returns chat if found', async () => {
      req.params = { chatId: '123' };
      const mockChat = { id: '123', title: 'Test' };
      getChatById.mockResolvedValue(mockChat);

      await getSingleChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    it('calls next with error if chat not found', async () => {
      req.params = { chatId: '999' };
      const error = new Error('Chat not found');
      error.statusCode = 404;
      getChatById.mockRejectedValue(error);

      await getSingleChat(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  describe('deleteChat', () => {
    it('deletes chat successfully', async () => {
      req.params = { chatId: '123' };
      deleteChatById.mockResolvedValue(true);

      await deleteChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Chat deleted successfully',
      });
    });

    it('returns 404 if chat not found', async () => {
      req.params = { chatId: '999' };
      deleteChatById.mockResolvedValue(false);

      await deleteChat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Chat not found' });
    });
  });
});
