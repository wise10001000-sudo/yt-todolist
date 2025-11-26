import { Request, Response } from 'express';
import { dbPool } from '../database';
import { hashPassword } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';

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

export const login = async (_req: Request, res: Response): Promise<void> => {
  // Implementation will be added in Backend-06
  sendError(res, 'NOT_IMPLEMENTED', 'Login functionality not yet implemented', 501);
};