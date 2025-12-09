import { jest } from '@jest/globals';
import request from 'supertest';

describe('Server', () => {
  let app;

  beforeAll(async () => {
    const module = await import('../../server.js');
    app = module.app;
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toEqual(404);
  });
});
