import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches the hash, false otherwise
 */
export const verifyPassword = async (password: string | null | undefined, hash: string | null | undefined): Promise<boolean> => {
  try {
    // Check if either parameter is null or undefined (but allow empty strings)
    if (password == null || hash == null) {
      return false;
    }
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
};

/**
 * Generate an access token
 * @param payload - Data to include in the token
 * @returns JWT access token
 */
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate a refresh token
 * @param payload - Data to include in the token
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify an access token
 * @param token - JWT access token to verify
 * @returns Decoded token payload if valid, null if invalid/expired
 */
export const verifyAccessToken = (token: string): any | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
  } catch (error) {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload if valid, null if invalid/expired
 */
export const verifyRefreshToken = (token: string): any | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
  } catch (error) {
    return null;
  }
};