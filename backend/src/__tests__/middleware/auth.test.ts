import { Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';
import { verifyAccessToken } from '../../utils/auth';
import { sendError } from '../../utils/response';

// Mock the auth utilities
jest.mock('../../utils/auth', () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock('../../utils/response', () => ({
  sendError: jest.fn()
}));

describe('JWT Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<typeof verifyAccessToken>;
  const mockSendError = sendError as jest.MockedFunction<typeof sendError>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock response for sendError
    mockSendError.mockImplementation((res, code, message, statusCode) => {
      (res as any).statusValue = statusCode;
      (res as any).jsonValue = { success: false, error: { code, message } };
      return res as Response;
    });
  });

  it('should return 401 if no authorization header is provided', () => {
    mockRequest.headers = {};

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockSendError).toHaveBeenCalledWith(
      mockResponse,
      'NO_TOKEN',
      'Access token is required',
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not contain a token', () => {
    mockRequest.headers = {
      authorization: 'Bearer '  // No token after Bearer
    };

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockSendError).toHaveBeenCalledWith(
      mockResponse,
      'NO_TOKEN',
      'Access token is required',
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token'
    };
    mockVerifyAccessToken.mockReturnValue(null);

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid_token');
    expect(mockSendError).toHaveBeenCalledWith(
      mockResponse,
      'INVALID_TOKEN',
      'Invalid or expired token',
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification throws an error', () => {
    mockRequest.headers = {
      authorization: 'Bearer some_token'
    };
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('Token verification error');
    });

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('some_token');
    expect(mockSendError).toHaveBeenCalledWith(
      mockResponse,
      'AUTH_ERROR',
      'Authentication failed',
      500
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach user info to req.user and call next when token is valid', () => {
    const mockDecodedToken = {
      userId: '123',
      email: 'test@example.com',
      iat: 1234567890,
      exp: 1234567890
    };

    mockRequest.headers = {
      authorization: 'Bearer valid_token'
    };
    mockVerifyAccessToken.mockReturnValue(mockDecodedToken);

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid_token');
    expect(mockRequest.user).toEqual({
      userId: '123',
      email: 'test@example.com'
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle different authorization header formats properly', () => {
    // Test lowercase 'bearer'
    mockRequest.headers = {
      authorization: 'bearer valid_token'
    };
    const mockDecodedToken = {
      userId: '123',
      email: 'test@example.com'
    };
    mockVerifyAccessToken.mockReturnValue(mockDecodedToken);

    authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid_token');
    expect(mockRequest.user).toEqual({
      userId: '123',
      email: 'test@example.com'
    });
    expect(mockNext).toHaveBeenCalled();
  });
});