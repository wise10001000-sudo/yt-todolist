import { Router } from 'express';
import { createTodo } from '../controllers/todoController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// POST /api/todos - Create a new todo
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
    body('content').optional().isString().isLength({ max: 2000 }).withMessage('Content must be less than 2000 characters'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    body('endDate').exists().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  (req: Request, res: Response, next: NextFunction) => {
    // Validation result handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Transform express-validator errors to match our error format
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMessages.join(', ')
        }
      });
    }
    return next();
  },
  createTodo
);

export default router;