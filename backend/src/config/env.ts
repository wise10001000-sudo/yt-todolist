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
  DB_HOST: getEnvVariable('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvVariable('DB_PORT', '5432'), 10),
  DB_NAME: getEnvVariable('DB_NAME', 'yt_todolist'),
  DB_USER: getEnvVariable('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD', ''),
  JWT_ACCESS_SECRET: getEnvVariable('JWT_ACCESS_SECRET', 'your_access_token_secret_key_here'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET', 'your_refresh_token_secret_key_here'),
  JWT_ACCESS_EXPIRES_IN: getEnvVariable('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5173'),
};
