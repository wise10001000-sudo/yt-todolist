import { Pool, PoolConfig } from 'pg';
import { env } from '../config/env';

// Database connection pool configuration
const poolConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 5, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times (optional, good for rebalancing)
};

// Create a connection pool
export const dbPool = new Pool(poolConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const client = await dbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database connection
export const initDatabase = async (): Promise<void> => {
  try {
    await testConnection();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// Close all database connections in the pool
export const closeDatabase = async (): Promise<void> => {
  try {
    await dbPool.end();
    console.log('🔒 Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
};