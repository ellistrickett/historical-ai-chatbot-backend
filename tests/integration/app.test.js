import request from 'supertest';
import { app } from '../../app.js'; // Import the app, NOT the server

describe('App Integration Check', () => {
  
  // 1. Test that the App initializes and handles 404s
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toEqual(404);
    // Matches your global error handler structure
    expect(res.body).toHaveProperty('message'); 
  });

  // 2. Test that Global Middleware (like CORS/Helmet) is working
  it('should have security headers (Helmet)', async () => {
    const res = await request(app).get('/api/chat/history');
    if (!res.headers['x-frame-options']) {
        console.log('DEBUG HEADERS:', res.headers);
    }
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
  });
});
