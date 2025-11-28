import dotenv from 'dotenv';
import { EnvConfig } from '../types';

dotenv.config();

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return defaultValue;
  }
  return value;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '3000'), 10),
  DATABASE_URL: getEnvVariable('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/yt_todolist'),
  JWT_ACCESS_SECRET: getEnvVariable('JWT_ACCESS_SECRET', 'your_access_token_secret_key_here'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET', 'your_refresh_token_secret_key_here'),
  JWT_ACCESS_EXPIRES_IN: getEnvVariable('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5173'),
};
