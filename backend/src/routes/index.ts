import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { isDatabaseHealthy } from '../database/health';
import authRoutes from './auth';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  // Check database health
  const dbHealthy = await isDatabaseHealthy();

  const healthData = {
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
    },
  };

  const statusCode = dbHealthy ? 200 : 503; // 503 if database is unhealthy

  return sendSuccess(res, healthData, statusCode);
});

// Hello World endpoint for testing
router.get('/', (_req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      message: 'Hello World! Welcome to yt-todolist API',
    },
    200
  );
});

export default router;
