import { beforeAll, afterAll } from '@jest/globals';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce logging noise in tests
});

afterAll(() => {
  // Cleanup if needed
});
