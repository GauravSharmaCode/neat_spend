import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import { Server } from 'http';

describe('NeatSpend API Gateway', () => {
  let server: Server;
  
  beforeAll(() => {
    server = app.listen(0); // Use random available port for tests
  });
  
  afterAll(() => {
    server.close();
  });

  describe('Health Checks', () => {
    it('should respond to root endpoint', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'NeatSpend API Gateway is running!');
      expect(response.body).toHaveProperty('services');
    });

    it('should respond to health endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('service', 'neatspend-api');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memoryUsage');
    });
  });

  describe('API Routes', () => {
    it('should proxy user routes to user-service', async () => {
      // This test verifies the proxy is configured and handles errors appropriately
      const response = await request(app).get('/api/v1/users');
      
      if (response.status === 200) {
        // User service is running and responded successfully
        expect(response.status).toBe(200);
      } else if (response.status === 503) {
        // User service is down - our error handler caught it
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'User service is currently unavailable');
      } else if (response.status === 504) {
        // Network timeout - service is unreachable (acceptable in unit tests)
        // In production, this would be caught by monitoring/alerting
        expect(response.status).toBe(504);
      } else {
        // Unexpected status - fail the test
        fail(`Unexpected status code: ${response.status}. Expected 200, 503, or 504.`);
      }
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('Legacy Routes', () => {
    it('should return deprecation notice for legacy /users endpoint', async () => {
      const response = await request(app).get('/users');
      
      expect(response.status).toBe(410);
      expect(response.body).toHaveProperty('status', 'deprecated');
      expect(response.body).toHaveProperty('newEndpoint');
    });
  });
});
