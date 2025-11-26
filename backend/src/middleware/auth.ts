import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      sendError(res, 'NO_TOKEN', 'Access token is required', 401);
      return;
    }

    // Verify the access token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      sendError(res, 'INVALID_TOKEN', 'Invalid or expired token', 401);
      return;
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Continue with the next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    sendError(res, 'AUTH_ERROR', 'Authentication failed', 500);
  }
};