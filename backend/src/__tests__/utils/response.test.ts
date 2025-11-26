import { Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';

describe('Response Utilities', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with default 200 status', () => {
      const data = { message: 'Test data' };
      sendSuccess(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      const data = { id: 1 };
      sendSuccess(mockResponse as Response, data, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with default 500 status', () => {
      sendError(mockResponse as Response, 'TEST_ERROR', 'Test error message');

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
      });
    });

    it('should send error response with custom status code', () => {
      sendError(mockResponse as Response, 'NOT_FOUND', 'Resource not found', 404);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    });
  });
});
