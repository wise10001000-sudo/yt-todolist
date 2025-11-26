import request from 'supertest';
import app from '../../app';
import { isDatabaseHealthy } from '../../database/health';

// Mock the database health check function
jest.mock('../../database/health', () => ({
  isDatabaseHealthy: jest.fn(),
}));

describe('Health Check Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return health status with database connected', async () => {
    (isDatabaseHealthy as jest.MockedFunction<typeof isDatabaseHealthy>).mockResolvedValue(true);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'ok',
        message: 'Server is running',
        timestamp: expect.any(String),
        services: {
          database: 'connected',
        },
      },
    });
  });

  it('should return health status with database disconnected and 503 status', async () => {
    (isDatabaseHealthy as jest.MockedFunction<typeof isDatabaseHealthy>).mockResolvedValue(false);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'ok',
        message: 'Server is running',
        timestamp: expect.any(String),
        services: {
          database: 'disconnected',
        },
      },
    });
  });

  it('should include timestamp in the response', async () => {
    const mockTimestamp = '2023-01-01T00:00:00.000Z';
    const originalISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = jest.fn(() => mockTimestamp);

    (isDatabaseHealthy as jest.MockedFunction<typeof isDatabaseHealthy>).mockResolvedValue(true);

    const response = await request(app).get('/api/health');

    expect(response.body.data.timestamp).toBe(mockTimestamp);

    // Restore original implementation
    Date.prototype.toISOString = originalISOString;
  });
});