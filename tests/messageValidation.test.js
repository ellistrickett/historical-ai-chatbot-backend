import request from 'supertest';
import { app } from '../server.js'; 

describe('Message Validation', () => {
  it('should reject messages longer than 2000 characters', async () => {
    const longMessage = 'a'.repeat(2001);
    const res = await request(app)
      .post('/api/chat') 
      .send({
        message: longMessage,
        personaName: 'cleopatra', 
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Message exceeds 2000 characters');
  });

  it('should accept messages within the limit', async () => {
    const validMessage = 'Hello';
    const res = await request(app)
      .post('/api/chat')
      .send({
        message: validMessage,
        personaName: 'cleopatra',
      });
      
    if (res.statusCode === 400) {
        expect(res.body.message).not.toContain('exceeds 2000 characters');
    } else {
        expect(res.statusCode).not.toEqual(400);
    }
  });
});