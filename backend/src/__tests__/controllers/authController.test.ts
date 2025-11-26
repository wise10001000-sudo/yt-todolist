import request from 'supertest';
import app from '../../app';
import { dbPool } from '../../database';

// Mock the database pool to avoid actual database calls during testing
jest.mock('../../database', () => ({
  dbPool: {
    query: jest.fn()
  }
}));

// Define the type for the mocked dbPool
const mockedDbPool = dbPool as jest.Mocked<typeof dbPool>;

describe('Auth Controller', () => {
  const mockQuery = mockedDbPool.query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const registerEndpoint = '/api/auth/register';

    it('should successfully register a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'Test User'
      };

      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      const mockCreatedAt = new Date().toISOString();
      
      // Mock that user doesn't exist (empty result)
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock password hashing
      jest.spyOn(require('../../utils/auth'), 'hashPassword').mockResolvedValue('hashed_password');
      // Mock successful user insertion
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: mockUserId,
          email: newUser.email,
          username: newUser.username,
          created_at: mockCreatedAt
        }]
      });

      const response = await request(app)
        .post(registerEndpoint)
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.username).toBe(newUser.username);
      expect(response.body.data.user).toHaveProperty('createdAt');
    });

    it('should return 400 if email, password, or username is missing', async () => {
      // Test missing email
      await request(app)
        .post(registerEndpoint)
        .send({ password: 'Password123!', username: 'Test User' })
        .expect(400);

      // Test missing password
      await request(app)
        .post(registerEndpoint)
        .send({ email: 'test@example.com', username: 'Test User' })
        .expect(400);

      // Test missing username
      await request(app)
        .post(registerEndpoint)
        .send({ email: 'test@example.com', password: 'Password123!' })
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'Password123!',
        username: 'Test User'
      };

      await request(app)
        .post(registerEndpoint)
        .send(invalidUser)
        .expect(400);
    });

    it('should return 400 for weak password (less than 8 characters)', async () => {
      const weakPasswordUser = {
        email: 'test@example.com',
        password: 'weak',
        username: 'Test User'
      };

      await request(app)
        .post(registerEndpoint)
        .send(weakPasswordUser)
        .expect(400);
    });

    it('should return 400 for invalid username length', async () => {
      // Test username too short
      await request(app)
        .post(registerEndpoint)
        .send({ email: 'test@example.com', password: 'Password123!', username: 'A' })
        .expect(400);

      // Test username too long
      await request(app)
        .post(registerEndpoint)
        .send({ 
          email: 'test@example.com', 
          password: 'Password123!', 
          username: 'ThisUsernameIsDefinitelyLongerThanFiftyCharactersWhichShouldCauseAnError' 
        })
        .expect(400);
    });

    it('should return 409 if email already exists', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'Password123!',
        username: 'Existing User'
      };

      // Mock that user already exists
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'some-id' }] });

      await request(app)
        .post(registerEndpoint)
        .send(existingUser)
        .expect(409);
    });

    it('should handle database errors during registration', async () => {
      const newUser = {
        email: 'error@example.com',
        password: 'Password123!',
        username: 'Error User'
      };

      // Mock the first query (check for existing user) to succeed
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock password hashing
      jest.spyOn(require('../../utils/auth'), 'hashPassword').mockResolvedValue('hashed_password');
      // Mock the second query (insert user) to fail
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .post(registerEndpoint)
        .send(newUser)
        .expect(500);
    });
  });
});