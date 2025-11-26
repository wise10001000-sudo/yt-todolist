import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('username').isLength({ min: 2, max: 50 })
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [
    body('refreshToken').exists().isString()
  ],
  refresh
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticateToken,  // Require authentication
  logout
);

export default router;