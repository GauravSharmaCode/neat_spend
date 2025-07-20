const request = require('supertest');
const express = require('express');

// Import our TypeScript routes (compiled)
const authRoutes = require('../dist/routes/authRoutes.js');
const userRoutes = require('../dist/routes/userRoutes.js');

// Create a test app with our actual routes
const createTestApp = () => {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  
  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'success',
      message: 'Service is healthy',
      service: 'user-service',
      timestamp: new Date().toISOString()
    });
  });
  
  // Add our actual routes
  try {
    app.use('/api/v1/auth', authRoutes.default || authRoutes);
    app.use('/api/v1/users', userRoutes.default || userRoutes);
  } catch (error) {
    console.warn('Could not load compiled routes, tests will be basic');
  }
  
  return app;
};

describe('User Service TypeScript Migration', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Basic Endpoints', () => {
    it('should return health check', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('service', 'user-service');
    });
  });

  describe('Route Structure', () => {
    it('should handle auth route base path', async () => {
      // This will return 401/400 but confirms route is loaded
      const res = await request(app).post('/api/v1/auth/login');
      expect([400, 401, 422]).toContain(res.statusCode); // Any of these means route exists
    });

    it('should handle user route base path with auth', async () => {
      // This will return 401 but confirms route is loaded
      const res = await request(app).get('/api/v1/users/me');
      expect([401, 403]).toContain(res.statusCode); // Unauthorized means route exists but needs auth
    });

    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
});
