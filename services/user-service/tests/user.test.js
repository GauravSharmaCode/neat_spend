const request = require('supertest');
const express = require('express');

// Mock the UserModel before importing the app
jest.mock('../src/models/UserModel');
const UserModel = require('../src/models/UserModel');

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }))
}));

// Create a test app without starting the server
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
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: 'user-service',
      version: '1.0.0',
      status: 'running'
    });
  });
  
  return app;
};

describe('User Service API', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health and Info Endpoints', () => {
    it('should return service info at root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message');
  });

  it('should return health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('service');
  });

  // Test suite for the POST /api/v1/users endpoint
  describe('POST /api/v1/auth/register', () => {
    it('should create a new user successfully', async () => {
      // --- 1. Mock Setup ---
      const newUserPayload = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = {
        id: 'user-123',
        ...newUserPayload,
        name: 'Test User',
        role: 'user',
        isActive: true,
        isVerified: false,
      };

      // Tell our mock functions what to return when called
      UserModel.checkExists.mockResolvedValue({ exists: false });
      UserModel.create.mockResolvedValue(createdUser);

      // --- 2. API Request ---
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserPayload);

      // --- 3. Assertions ---
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id', 'user-123');
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      
      // Ensure the password is not returned in the response
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return a 409 conflict error if the user already exists', async () => {
      // --- 1. Mock Setup ---
      const newUserPayload = {
        email: 'existing@example.com',
        password: 'TestPassword123!',
        firstName: 'Existing',
        lastName: 'User',
      };

      // Simulate that the user's email already exists in the database
      UserModel.checkExists.mockResolvedValue({ 
        exists: true, 
        user: { email: 'existing@example.com' } 
      });

      // --- 2. API Request ---
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserPayload);

      // --- 3. Assertions ---
      expect(res.statusCode).toBe(409); // 409 Conflict
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'User with this email already exists');
    });
  });
});