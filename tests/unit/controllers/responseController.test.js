import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../services/responseService.js', () => ({
    generateBotReply: jest.fn(),
}));

jest.unstable_mockModule('../../../services/personaService.js', () => ({
    getPersona: jest.fn(),
}));

// Dynamic imports
const { generateBotReply } = await import('../../../services/responseService.js');
const { getPersona } = await import('../../../services/personaService.js');
const { handleChatRequest } = await import('../../../controllers/responseController.js');

describe('Response Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('handleChatRequest', () => {
        it('returns 400 if personaName is missing', async () => {
            req.body = { message: 'Hi' };
            await handleChatRequest(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Persona name is required' });
        });

        it('returns 404 if persona not found', async () => {
            req.body = { message: 'Hi', personaName: 'Unknown' };
            getPersona.mockReturnValue(null);

            await handleChatRequest(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('returns reply on success', async () => {
            req.body = { message: 'Hi', personaName: 'Cleopatra' };
            getPersona.mockReturnValue({ name: 'Cleopatra' });
            generateBotReply.mockResolvedValue({
                reply: 'Hello',
                treeState: null,
                mode: 'topic_match'
            });

            await handleChatRequest(req, res);
            expect(res.json).toHaveBeenCalledWith({
                reply: 'Hello',
                treeState: null,
                mode: 'topic_match'
            });
        });
    });
});
