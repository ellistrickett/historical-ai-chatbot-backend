import request from 'supertest';
import { app } from '../server.js'; // Ensure extension is present

describe('Message Validation', () => {
  it('should reject messages longer than 2000 characters', async () => {
    const longMessage = 'a'.repeat(2001);
    const res = await request(app)
      .post('/api/chat') // Adjust route if necessary
      .send({
        message: longMessage,
        personaName: 'cleopatra', // Use a valid persona
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Message exceeds 2000 characters');
  });

  it('should accept messages within the limit', async () => {
    const validMessage = 'Hello';
    const res = await request(app)
      .post('/api/chat')
      .send({
        message: validMessage,
        personaName: 'cleopatra',
      });

    // Depending on the mock setup, this might be 200 or another error, 
    // but it definitely shouldn't be the 2000 char error.
    // We just want to ensure it passes the length check.
    if (res.statusCode === 400) {
        expect(res.body.error).not.toBe('Message exceeds 2000 characters');
    } else {
        expect(res.statusCode).not.toEqual(400);
    }
  });
});
