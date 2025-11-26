import request from 'supertest';
import app from '../app';

describe('Basic Express App Tests', () => {
  describe('GET /api', () => {
    it('should return Hello World message', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toContain('Hello World');
    });
  });

  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('message', 'Server is running');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should return ISO timestamp', async () => {
      const response = await request(app).get('/api/health');

      const timestamp = response.body.data.timestamp;
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toContain('/api/non-existent-route');
    });
  });

  describe('CORS', () => {
    it('should have CORS headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should have security headers from Helmet', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
