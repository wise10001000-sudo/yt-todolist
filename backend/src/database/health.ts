import { dbPool } from './index';

// Check database health by executing a simple query
export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    const client = await dbPool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};