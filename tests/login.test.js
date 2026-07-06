const request = require('supertest');
const app = require('../server');
const db = require('../db_mysql');

// Mock the database pool
jest.mock('../db_mysql', () => ({
  query: jest.fn()
}));

describe('Authentication API - /api/auth/login', () => {
  beforeEach(() => {
    // Clear mock data before each test
    jest.clearAllMocks();
  });

  it('should return 200 and success status on valid login', async () => {
    // Mock database to return a user
    const mockUser = { email: 'admin@vitalis.ai', name: 'Admin', role: 'System Admin' };
    db.query.mockResolvedValueOnce([[mockUser]]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vitalis.ai', password: 'password123' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toEqual({
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role
    });

    // Ensure the query was called correctly
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      ['admin@vitalis.ai', 'password123']
    );
  });

  it('should return 401 on invalid email or password', async () => {
    // Mock database to return empty array (no user found)
    db.query.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should return 500 on server/database error', async () => {
    // Mock database to throw an error
    db.query.mockRejectedValueOnce(new Error('Database connection failed'));

    // We might want to suppress console.error in this specific test
    // to keep test output clean, since server.js logs it
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'error@example.com', password: 'password' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Server error');

    console.error.mockRestore(); // Restore console.error
  });
});
