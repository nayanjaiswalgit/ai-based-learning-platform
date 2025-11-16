// Global test setup file
// This file runs before all tests

beforeAll(async () => {
  // Setup test database connection if needed
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/learning_platform_test';
});

afterAll(async () => {
  // Cleanup
});
