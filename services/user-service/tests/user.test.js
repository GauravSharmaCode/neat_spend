const request = require('supertest');
const app = require('../src/index'); // Your Express app
const UserModel = require('../src/models/UserModel'); // The model we need to mock

/**
 * @description
 * Mock the UserModel. Jest will now intercept any 'require' or 'import' for
 * this module and use our mock instead of the real database model.
 */
jest.mock('../src/models/UserModel');

describe('User Service API', () => {

  // This clears all mock history and implementations after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

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