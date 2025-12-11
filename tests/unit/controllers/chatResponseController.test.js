import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../services/chatResponseService.js', () => ({
  generateBotReply: jest.fn(),
}));

jest.unstable_mockModule('../../../services/personaService.js', () => ({
  getPersona: jest.fn(),
}));

// Dynamic imports
const { generateBotReply } = await import(
  '../../../services/chatResponseService.js'
);
const { getPersona } = await import('../../../services/personaService.js');
const { handleChatRequest } = await import(
  '../../../controllers/chatResponseController.js'
);

describe('Response Controller', () => {
  let req, res, next; // <--- Added 'next'

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn(); // <--- Mock the next function
  });

  describe('handleChatRequest', () => {
    it('calls next with error (400) if personaName is missing', async () => {
      req.body = { message: 'Hi' };
      
      await handleChatRequest(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Persona name is required'),
        })
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it('calls next with error (404) if persona not found', async () => {
      req.body = { message: 'Hi', personaName: 'Unknown' };
      getPersona.mockReturnValue(null);

      await handleChatRequest(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('not found'),
        })
      );
    });

    it('returns reply on success (200)', async () => {
      // 1. Setup Request
      req.body = { message: 'Hi', personaName: 'Cleopatra', history: [] };
      
      // 2. Setup Mocks
      getPersona.mockReturnValue({ name: 'Cleopatra' });
      const mockResponse = {
        reply: 'Hello',
        treeState: null,
        mode: 'topic_match',
        options: null,
        timestamp: 'now'
      };
      generateBotReply.mockResolvedValue(mockResponse);

      // 3. Call Controller
      await handleChatRequest(req, res, next);
      
      // 4. Assert Success
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(next).not.toHaveBeenCalled(); // Success means next() is NOT called
    });
  });
});