import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../../utils/auth';
import jwt from 'jsonwebtoken';

// Enable fake timers for this test file
jest.useFakeTimers();

// Mock environment variables for testing
jest.mock('../../config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test_access_secret',
    JWT_REFRESH_SECRET: 'test_refresh_secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    const testPassword = 'testPassword123!';
    let hashedPassword: string;

    beforeEach(async () => {
      hashedPassword = await hashPassword(testPassword);
    });

    it('should properly hash a password', async () => {
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword); // Should not be the same as plain text
      expect(hashedPassword).toMatch(/^\$2[ayb]\$12\$[A-Za-z0-9./]{53}$/); // bcrypt hash format
    });

    it('should correctly verify a password against its hash', async () => {
      const isValid = await verifyPassword(testPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect passwords', async () => {
      const wrongPassword = 'wrongPassword456!';
      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false when verifying against a different hash', async () => {
      const differentPassword = 'differentPassword789!';
      const differentHash = await hashPassword(differentPassword);
      
      const isValid = await verifyPassword(testPassword, differentHash);
      expect(isValid).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const emptyHash = await hashPassword('');
      const isValid = await verifyPassword('', emptyHash);
      expect(isValid).toBe(true);
    });

    it('should handle special characters in passwords', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialHash = await hashPassword(specialPassword);
      
      const isValid = await verifyPassword(specialPassword, specialHash);
      expect(isValid).toBe(true);
    });
  });

  describe('JWT Functionality', () => {
    const testPayload = { userId: 1, email: 'test@example.com', role: 'user' };

    describe('Access Token', () => {
      it('should create a valid JWT access token', () => {
        const token = generateAccessToken(testPayload);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
      });

      it('should validate a valid access token and return payload', () => {
        const token = generateAccessToken(testPayload);
        const decoded = verifyAccessToken(token);
        
        expect(decoded).toBeDefined();
        expect(decoded.userId).toBe(testPayload.userId);
        expect(decoded.email).toBe(testPayload.email);
        expect(decoded.role).toBe(testPayload.role);
        expect(decoded.exp).toBeDefined(); // Should have expiration
        expect(decoded.iat).toBeDefined(); // Should have issued at
      });

      it('should return null for an invalid access token', () => {
        const invalidToken = 'invalid.token.format';
        const decoded = verifyAccessToken(invalidToken);
        
        expect(decoded).toBeNull();
      });

      it('should return null for an access token with wrong secret', () => {
        // Create a token with a different secret to simulate invalid token
        const differentSecret = 'different_secret';
        const differentToken = jwt.sign(
          testPayload,
          differentSecret,
          { expiresIn: '15m' }
        );

        const decoded = verifyAccessToken(differentToken);
        expect(decoded).toBeNull();
      });

      it('should return null for an expired access token', () => {
        // Create a token that expired in the past
        const expiredToken = jwt.sign(
          testPayload,
          'test_access_secret',
          { expiresIn: '0s' } // Expired immediately
        );

        // Wait a bit to ensure the token is actually expired
        jest.advanceTimersByTime(100);

        const decoded = verifyAccessToken(expiredToken);
        expect(decoded).toBeNull();
      });
    });

    describe('Refresh Token', () => {
      it('should create a valid JWT refresh token', () => {
        const token = generateRefreshToken(testPayload);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
      });

      it('should validate a valid refresh token and return payload', () => {
        const token = generateRefreshToken(testPayload);
        const decoded = verifyRefreshToken(token);
        
        expect(decoded).toBeDefined();
        expect(decoded.userId).toBe(testPayload.userId);
        expect(decoded.email).toBe(testPayload.email);
        expect(decoded.role).toBe(testPayload.role);
        expect(decoded.exp).toBeDefined(); // Should have expiration
        expect(decoded.iat).toBeDefined(); // Should have issued at
      });

      it('should return null for an invalid refresh token', () => {
        const invalidToken = 'invalid.token.format';
        const decoded = verifyRefreshToken(invalidToken);
        
        expect(decoded).toBeNull();
      });

      it('should return null for a refresh token with wrong secret', () => {
        // Create a token with a different secret to simulate invalid token
        const differentSecret = 'different_secret';
        const differentToken = jwt.sign(
          testPayload,
          differentSecret,
          { expiresIn: '7d' }
        );

        const decoded = verifyRefreshToken(differentToken);
        expect(decoded).toBeNull();
      });

      it('should return null for an expired refresh token', () => {
        // Create a token that expired in the past
        const expiredToken = jwt.sign(
          testPayload,
          'test_refresh_secret',
          { expiresIn: '0s' } // Expired immediately
        );

        // Wait a bit to ensure the token is actually expired
        jest.advanceTimersByTime(100);

        const decoded = verifyRefreshToken(expiredToken);
        expect(decoded).toBeNull();
      });
    });

    describe('Token Differentiation', () => {
      it('should not accept access token where refresh token is expected', () => {
        const accessToken = generateAccessToken(testPayload);
        const decoded = verifyRefreshToken(accessToken); // Using access token as refresh token
        
        expect(decoded).toBeNull();
      });

      it('should not accept refresh token where access token is expected', () => {
        const refreshToken = generateRefreshToken(testPayload);
        const decoded = verifyAccessToken(refreshToken); // Using refresh token as access token
        
        expect(decoded).toBeNull();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      expect(() => hashPassword(null as any)).rejects.toThrow();
      expect(() => hashPassword(undefined as any)).rejects.toThrow();
      
      expect(verifyPassword('password', null as any)).resolves.toBe(false);
      expect(verifyPassword('password', undefined as any)).resolves.toBe(false);
      
      expect(verifyAccessToken(null as any)).toBeNull();
      expect(verifyAccessToken(undefined as any)).toBeNull();
      
      expect(verifyRefreshToken(null as any)).toBeNull();
      expect(verifyRefreshToken(undefined as any)).toBeNull();
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hashed = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should handle complex payloads', () => {
      const complexPayload = {
        userId: 123,
        email: 'complex@example.com',
        profile: {
          name: 'Test User',
          preferences: { theme: 'dark', notifications: true },
        },
        permissions: ['read', 'write'],
        metadata: {
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      };

      const token = generateAccessToken(complexPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(complexPayload.userId);
      expect(decoded.email).toBe(complexPayload.email);
      expect(decoded.profile).toEqual(complexPayload.profile);
      expect(decoded.permissions).toEqual(complexPayload.permissions);
    });
  });
});