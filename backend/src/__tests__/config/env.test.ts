import { env } from '../../config/env';

describe('Environment Configuration', () => {
  it('should load environment variables', () => {
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeGreaterThan(0);
  });

  it('should have required database configuration', () => {
    expect(env.DB_HOST).toBeDefined();
    expect(env.DB_PORT).toBeGreaterThan(0);
    expect(env.DB_NAME).toBeDefined();
    expect(env.DB_USER).toBeDefined();
  });

  it('should have JWT configuration', () => {
    expect(env.JWT_ACCESS_SECRET).toBeDefined();
    expect(env.JWT_REFRESH_SECRET).toBeDefined();
    expect(env.JWT_ACCESS_EXPIRES_IN).toBeDefined();
    expect(env.JWT_REFRESH_EXPIRES_IN).toBeDefined();
  });

  it('should have CORS configuration', () => {
    expect(env.CORS_ORIGIN).toBeDefined();
  });

  it('should have correct data types', () => {
    expect(typeof env.NODE_ENV).toBe('string');
    expect(typeof env.PORT).toBe('number');
    expect(typeof env.DB_PORT).toBe('number');
  });
});
