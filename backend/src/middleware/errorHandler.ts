import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode);
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Send generic error response
  return sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};
