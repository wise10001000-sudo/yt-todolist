import { Request, Response } from 'express';
import { dbPool } from '../database';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyPassword, verifyRefreshToken, verifyAccessToken } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Input validation
    if (!email || !password || !username) {
      sendError(res, 'VALIDATION_ERROR', 'Email, password, and username are required', 400);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, 'INVALID_EMAIL', 'Invalid email format', 400);
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      sendError(res, 'WEAK_PASSWORD', 'Password must be at least 8 characters long', 400);
      return;
    }

    // Username length validation
    if (username.length < 2 || username.length > 50) {
      sendError(res, 'INVALID_USERNAME', 'Username must be between 2 and 50 characters', 400);
      return;
    }

    // Check if user with email already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUserResult = await dbPool.query(existingUserQuery, [email]);

    if (existingUserResult.rows.length > 0) {
      sendError(res, 'EMAIL_EXISTS', 'Email already exists', 409);
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert new user into database
    const insertUserQuery = `
      INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, created_at
    `;
    const result = await dbPool.query(insertUserQuery, [email, hashedPassword, username]);

    // Return success response
    const user = result.rows[0];
    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at
        }
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'REGISTRATION_ERROR', 'An error occurred during registration', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      sendError(res, 'VALIDATION_ERROR', 'Email and password are required', 400);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, 'INVALID_EMAIL', 'Invalid email format', 400);
      return;
    }

    // Find user by email
    const findUserQuery = 'SELECT id, email, username, password_hash FROM users WHERE email = $1';
    const result = await dbPool.query(findUserQuery, [email]);

    if (result.rows.length === 0) {
      // To prevent user enumeration, use the same error message
      sendError(res, 'AUTHENTICATION_FAILED', 'Invalid email or password', 401);
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      sendError(res, 'AUTHENTICATION_FAILED', 'Invalid email or password', 401);
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Calculate expiration time based on JWT_REFRESH_EXPIRES_IN
    // The format is typically like '7d' for 7 days, '30m' for 30 minutes, etc.
    const expiresAt = calculateExpirationDate(env.JWT_REFRESH_EXPIRES_IN);

    // Store refresh token in database
    const storeRefreshTokenQuery = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    await dbPool.query(storeRefreshTokenQuery, [user.id, refreshToken, expiresAt]);

    // Return successful login response
    sendSuccess(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    }, 200);
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'LOGIN_ERROR', 'An error occurred during login', 500);
  }
};

/**
 * Calculate expiration date based on JWT expiration string (e.g., '7d', '30m', '24h')
 * @param expiresIn - Expiration string in format like '7d', '30m', '24h'
 * @returns Expiration date as Date object
 */
const calculateExpirationDate = (expiresIn: string): Date => {
  const now = new Date();
  const value = parseInt(expiresIn.match(/\d+/)?.[0] || '0', 10);
  const unit = expiresIn.match(/[a-z]+/i)?.[0] || '';

  switch (unit.toLowerCase()) {
    case 's': // seconds
      return new Date(now.getTime() + value * 1000);
    case 'm': // minutes
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h': // hours
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd': // days
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'w': // weeks
      return new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
    default:
      // Default to 7 days if format is unknown
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      sendError(res, 'NO_REFRESH_TOKEN', 'Refresh token is required', 401);
      return;
    }

    // Verify the refresh token format first (check if it's a valid JWT structure)
    if (typeof refreshToken !== 'string' || !refreshToken.includes('.')) {
      sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token format', 401);
      return;
    }

    // Check if the refresh token exists in the database
    const findRefreshTokenQuery = 'SELECT id, user_id FROM refresh_tokens WHERE token = $1';
    const tokenResult = await dbPool.query(findRefreshTokenQuery, [refreshToken]);

    if (tokenResult.rows.length === 0) {
      sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
      return;
    }

    const tokenRecord = tokenResult.rows[0];

    // Verify the refresh token using the auth utility
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      // Token is invalid or expired, remove it from the database
      await dbPool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id]);
      sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
      return;
    }

    // Get user info to generate new access token
    const findUserQuery = 'SELECT id, email FROM users WHERE id = $1';
    const userResult = await dbPool.query(findUserQuery, [tokenRecord.user_id]);

    if (userResult.rows.length === 0) {
      // If user doesn't exist anymore, remove the token
      await dbPool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id]);
      sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token', 401);
      return;
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Return the new access token
    sendSuccess(res, {
      accessToken: newAccessToken
    }, 200);

  } catch (error) {
    console.error('Refresh token error:', error);
    sendError(res, 'REFRESH_ERROR', 'An error occurred during token refresh', 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      sendError(res, 'NO_TOKEN', 'Access token is required', 401);
      return;
    }

    // Verify the access token to get user info
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      sendError(res, 'INVALID_TOKEN', 'Invalid or expired access token', 401);
      return;
    }

    const userId = decoded.userId;

    // Delete the refresh token associated with this user from the database
    // This will invalidate the refresh token, preventing future token refreshes
    const deleteRefreshTokenQuery = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await dbPool.query(deleteRefreshTokenQuery, [userId]);

    // Return success response
    sendSuccess(res, {
      message: '로그아웃되었습니다.'
    }, 200);
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'LOGOUT_ERROR', 'An error occurred during logout', 500);
  }
};