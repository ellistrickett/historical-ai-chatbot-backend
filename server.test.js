import { jest } from '@jest/globals';
import request from 'supertest';

describe('Server', () => {
    let app;

    beforeAll(async () => {
        // Silence console logs during server startup
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        const module = await import('./server.js');
        app = module.app;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/unknown-route');
        expect(res.statusCode).toEqual(404);
    });
});
