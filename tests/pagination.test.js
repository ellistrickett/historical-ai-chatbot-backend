import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the repository before importing the app
jest.unstable_mockModule('../repositories/chatHistoryRepository.js', () => ({
  readChatsFile: jest.fn(),
  writeChatsFile: jest.fn(),
}));

// Dynamic import to ensure mocks are applied
const { app } = await import('../server.js');
const { readChatsFile } = await import('../repositories/chatHistoryRepository.js');

describe('Pagination API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return first page of chats', async () => {
    const mockChats = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Chat ${i + 1}`,
      personaName: 'Cleopatra',
      date: new Date().toISOString(),
    }));
    readChatsFile.mockResolvedValue(mockChats);

    const res = await request(app).get('/api/chat/history?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.chats).toHaveLength(5);
    expect(res.body.hasMore).toBe(true);
    expect(res.body.total).toBe(10);
    expect(res.body.chats[0].id).toBe('1');
    expect(res.body.chats[4].id).toBe('5');
  });

  it('should return second page of chats', async () => {
    const mockChats = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Chat ${i + 1}`,
      personaName: 'Cleopatra',
      date: new Date().toISOString(),
    }));
    readChatsFile.mockResolvedValue(mockChats);

    const res = await request(app).get('/api/chat/history?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.chats).toHaveLength(5);
    expect(res.body.hasMore).toBe(false); // 10 items, page 2 of 5 items = end
    expect(res.body.chats[0].id).toBe('6');
  });

  it('should return empty array if page out of range', async () => {
    const mockChats = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Chat ${i + 1}`,
    }));
    readChatsFile.mockResolvedValue(mockChats);

    const res = await request(app).get('/api/chat/history?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.chats).toHaveLength(0);
    expect(res.body.hasMore).toBe(false);
  });
});
