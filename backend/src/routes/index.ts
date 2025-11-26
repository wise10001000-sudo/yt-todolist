import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    },
    200
  );
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
