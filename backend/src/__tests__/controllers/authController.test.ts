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

  describe('POST /api/auth/login', () => {
    const loginEndpoint = '/api/auth/login';

    it('should successfully login a user with valid credentials', async () => {
      const existingUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        password: 'Password123!',
        username: 'Test User',
        password_hash: 'hashed_password'
      };

      // Mock user found in database
      mockQuery.mockResolvedValueOnce({ rows: [existingUser] });
      // Mock successful password verification
      jest.spyOn(require('../../utils/auth'), 'verifyPassword').mockResolvedValue(true);
      // Mock token generation
      jest.spyOn(require('../../utils/auth'), 'generateAccessToken').mockReturnValue('access_token');
      jest.spyOn(require('../../utils/auth'), 'generateRefreshToken').mockReturnValue('refresh_token');
      // Mock storing refresh token in database
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'refresh_token_id' }] });

      const response = await request(app)
        .post(loginEndpoint)
        .send({
          email: existingUser.email,
          password: existingUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(existingUser.email);
      expect(response.body.data.user.username).toBe(existingUser.username);
    });

    it('should return 401 for invalid email', async () => {
      // Mock no user found in database
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .post(loginEndpoint)
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      const existingUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        password: 'Password123!',
        username: 'Test User',
        password_hash: 'hashed_password'
      };

      // Mock user found in database
      mockQuery.mockResolvedValueOnce({ rows: [existingUser] });
      // Mock failed password verification
      jest.spyOn(require('../../utils/auth'), 'verifyPassword').mockResolvedValue(false);

      await request(app)
        .post(loginEndpoint)
        .send({
          email: existingUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
    });

    it('should return 400 for missing email or password', async () => {
      // Test missing email
      await request(app)
        .post(loginEndpoint)
        .send({ password: 'Password123!' })
        .expect(400);

      // Test missing password
      await request(app)
        .post(loginEndpoint)
        .send({ email: 'test@example.com' })
        .expect(400);

      // Test missing both
      await request(app)
        .post(loginEndpoint)
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app)
        .post(loginEndpoint)
        .send({ email: 'invalid-email', password: 'Password123!' })
        .expect(400);
    });

    it('should handle database errors during login', async () => {
      // Mock database error when finding user
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .post(loginEndpoint)
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(500);
    });
  });

  describe('POST /api/auth/refresh', () => {
    const refreshEndpoint = '/api/auth/refresh';

    it('should return new access token with valid refresh token', async () => {
      const mockRefreshToken = 'header.payload.signature';
      const mockUserId = '123';
      const mockUserEmail = 'test@example.com';
      const mockAccessToken = 'new_access_token';

      // Mock finding the refresh token in the DB
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'token_id', user_id: mockUserId }]
      });

      // Mock verifying the refresh token
      jest.spyOn(require('../../utils/auth'), 'verifyRefreshToken')
        .mockReturnValue({ userId: mockUserId });

      // Mock finding the user
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: mockUserId, email: mockUserEmail }]
      });

      // Mock generating new access token
      jest.spyOn(require('../../utils/auth'), 'generateAccessToken')
        .mockReturnValue(mockAccessToken);

      const response = await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: mockRefreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.accessToken).toBe(mockAccessToken);
    });

    it('should return 401 if no refresh token provided', async () => {
      await request(app)
        .post(refreshEndpoint)
        .send({})
        .expect(401);
    });

    it('should return 401 if refresh token has invalid format', async () => {
      await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: 'invalid_format' })
        .expect(401);
    });

    it('should return 401 if refresh token does not exist in DB', async () => {
      const invalidToken = 'invalid_refresh_token';

      // Mock no refresh token found in DB
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: invalidToken })
        .expect(401);
    });

    it('should return 401 if refresh token is expired/invalid', async () => {
      const invalidToken = 'invalid_token';
      const mockTokenId = 'token_id';
      const mockUserId = '123';

      // Mock token exists in DB
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: mockTokenId, user_id: mockUserId }]
      });

      // Mock refresh token verification failure
      jest.spyOn(require('../../utils/auth'), 'verifyRefreshToken')
        .mockReturnValue(null);

      // Mock deletion of invalid token
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: invalidToken })
        .expect(401);
    });

    it('should return 401 if user associated with refresh token does not exist', async () => {
      const mockRefreshToken = 'valid_refresh_token';
      const mockUserId = 'nonexistent_user_id';
      const mockTokenId = 'token_id';

      // Mock finding the refresh token in the DB
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: mockTokenId, user_id: mockUserId }]
      });

      // Mock verifying the refresh token
      jest.spyOn(require('../../utils/auth'), 'verifyRefreshToken')
        .mockReturnValue({ userId: mockUserId });

      // Mock no user found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      // Mock deletion of the token
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: mockRefreshToken })
        .expect(401);
    });

    it('should handle database errors during refresh', async () => {
      const mockRefreshToken = 'header.payload.signature';  // Valid format to pass initial validation

      // Reset mock and set up the specific error scenario
      mockQuery.mockImplementationOnce(() => Promise.reject(new Error('Database error')));

      await request(app)
        .post(refreshEndpoint)
        .send({ refreshToken: mockRefreshToken })
        .expect(500);
    });
  });

  describe('POST /api/auth/logout', () => {
    const logoutEndpoint = '/api/auth/logout';

    it('should successfully logout a user and delete refresh token', async () => {
      const mockUserId = '123';
      const mockAccessToken = 'valid_access_token';

      // Mock access token verification
      jest.spyOn(require('../../utils/auth'), 'verifyAccessToken')
        .mockReturnValue({ userId: mockUserId, email: 'test@example.com' });

      // Mock deletion of refresh tokens
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .post(logoutEndpoint)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('로그아웃되었습니다.');

      // Verify the DB query was called to delete refresh tokens
      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [mockUserId]
      );
    });

    it('should return 401 if no authorization header is provided', async () => {
      await request(app)
        .post(logoutEndpoint)
        .expect(401);
    });

    it('should return 401 if invalid access token is provided', async () => {
      const invalidToken = 'invalid_token';

      // Mock access token verification failure
      jest.spyOn(require('../../utils/auth'), 'verifyAccessToken')
        .mockReturnValue(null);

      await request(app)
        .post(logoutEndpoint)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should handle database errors during logout', async () => {
      const mockUserId = '123';
      const mockAccessToken = 'valid_access_token';

      // Mock access token verification
      jest.spyOn(require('../../utils/auth'), 'verifyAccessToken')
        .mockReturnValue({ userId: mockUserId, email: 'test@example.com' });

      // Mock database error during refresh token deletion
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .post(logoutEndpoint)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(500);
    });
  });
});