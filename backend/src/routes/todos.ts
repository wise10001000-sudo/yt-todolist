import { Router } from 'express';
import { createTodo, getTodos } from '../controllers/todoController';
import { authenticateToken } from '../middleware/auth';
import { body, query } from 'express-validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
};

// GET /api/todos - Get all todos for the user
router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  handleValidationErrors,
  getTodos
);


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
  handleValidationErrors,
  createTodo
);

export default router;