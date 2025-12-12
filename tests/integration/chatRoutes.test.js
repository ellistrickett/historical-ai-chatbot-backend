import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- 1. MOCK RATE LIMITER ---
// We use a strategy function to control the limiter behavior dynamically
let rateLimitStrategy = (req, res, next) => next(); 

jest.unstable_mockModule('express-rate-limit', () => ({
  default: jest.fn(() => (req, res, next) => rateLimitStrategy(req, res, next)),
}));

// --- 2. MOCK DATA LAYER (Services & Repositories) ---

// Mock Chat Response Service (AI Logic)
jest.unstable_mockModule('../../services/chatResponseService.js', () => ({
  generateBotReply: jest.fn().mockResolvedValue({ 
    reply: 'Mock Reply', 
    timestamp: Date.now() 
  }),
}));

// Mock Persona Service (Configuration)
jest.unstable_mockModule('../../services/personaService.js', () => ({
  loadPersonas: jest.fn(),
  getPersona: jest.fn(() => ({
    name: 'TestPersona',
    role: 'Mock Role',
    persona: { name: 'Test Name', tone: 'Test Tone' },
    topics: {},
    responses: {},
  })),
}));

// CRITICAL FIX: Mock the Repository, NOT the Controller
// This prevents the real controller from hanging when trying to connect to the DB.
jest.unstable_mockModule('../../repositories/chatHistoryRepository.js', () => ({
  createChat: jest.fn().mockResolvedValue({ id: 'mock-chat-id' }),
  readChatsFile: jest.fn().mockResolvedValue([]),
  writeChatsFile: jest.fn().mockResolvedValue(true),
  // Add any other repo methods your controller uses
}));

// --- 3. IMPORT APP ---
const { app } = await import('../../app.js');

describe('Chat Routes Integration (Rate Limiting)', () => {
  
  beforeEach(() => {
    rateLimitStrategy = (req, res, next) => next();
    jest.clearAllMocks();
  });

  it('returns 429 Too Many Requests after hitting the limit', async () => {
    // 1. Setup Block Strategy
    let requestCount = 0;
    rateLimitStrategy = (req, res, next) => {
      requestCount++;
      if (requestCount > 2) {
        return res.status(429).json({ message: 'AI quota exceeded.' });
      }
      next();
    };

    // 2. Setup Robust Payload (Send both common field names to be safe against validation)
    const payload = { 
        userMessage: 'Test', 
        message: 'Test',      // Fallback in case controller expects 'message'
        personaName: 'TestPersona',
        history: [] 
    };

    // Request 1: Success
    await request(app).post('/api/chat').send(payload).expect(200);

    // Request 2: Success
    await request(app).post('/api/chat').send(payload).expect(200);

    // Request 3: Blocked by Middleware
    const response = await request(app)
      .post('/api/chat')
      .send(payload)
      .expect(429);

    expect(response.body.message).toBe('AI quota exceeded.');
  });

  it('does NOT apply the limit to the chat history route', async () => {
    // 1. Setup Blocking Strategy (Trigger immediately)
    rateLimitStrategy = (req, res, next) => {
        return res.status(429).json({ message: 'Should not run!' });
    };

    // 2. Hit History Route
    // Because this route is NOT rate limited, it should skip our blocking strategy
    // and hit the (mocked) repository, returning 200.
    const response = await request(app)
      .get('/api/chat/history')
      .expect(200);

    expect(response.status).toBe(200);
  });
});