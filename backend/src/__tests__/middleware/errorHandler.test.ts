import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();

    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with custom values', () => {
      const error = new AppError('Not found', 404, 'NOT_FOUND');

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_ERROR');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error',
        },
      });
    });

    it('should handle generic Error as internal error', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', error);
    });
  });
});
