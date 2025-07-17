// Test setup file for neatspend-api
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db?schema=public';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '8080';
process.env.SERVICE_NAME = 'neatspend-api';
process.env.USER_SERVICE_URL = 'http://localhost:3001';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock console methods to reduce test output noise
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});
