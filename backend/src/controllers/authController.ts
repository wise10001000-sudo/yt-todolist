import { Request, Response } from 'express';
import { dbPool } from '../database';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyPassword } from '../utils/auth';
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