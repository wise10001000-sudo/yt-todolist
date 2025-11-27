import { Router } from 'express';
import { createTodo, getTodos, getTodoById, updateTodo, deleteTodo, getTrashTodos, restoreTodo, permanentlyDeleteTodo } from '../controllers/todoController';
import { authenticateToken } from '../middleware/auth';
import { body, query, param } from 'express-validator';
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

// GET /api/todos/trash - Get all trashed todos for the user
router.get(
  '/trash',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getTrashTodos
);

// POST /api/todos/trash/:id/restore - Restore a trashed todo
router.post(
  '/trash/:id/restore',
  authenticateToken,
  [
    param('id').isUUID().withMessage('ID must be a valid UUID')
  ],
  handleValidationErrors,
  restoreTodo
);

// DELETE /api/todos/trash/:id - Permanently delete a trashed todo
router.delete(
  '/trash/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('ID must be a valid UUID')
  ],
  handleValidationErrors,
  permanentlyDeleteTodo
);

// GET /api/todos/:id - Get a single todo by ID
router.get(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('ID must be a valid UUID')
  ],
  handleValidationErrors,
  getTodoById
);

// PUT /api/todos/:id - Update a todo
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
    body('content').optional().isString().isLength({ max: 2000 }),
    body('startDate').optional({ nullable: true }).isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('status').optional().isIn(['active', 'trash']).withMessage('Invalid status'),
    // Custom validation to ensure end_date is after start_date if both are provided
    body().custom((_value, { req }) => {
        const { startDate, endDate } = req.body;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('End date must be after start date');
        }
        return true;
    })
  ],
  handleValidationErrors,
  updateTodo
);

// DELETE /api/todos/:id - Soft delete a todo
router.delete(
    '/:id',
    authenticateToken,
    [
        param('id').isUUID().withMessage('ID must be a valid UUID')
    ],
    handleValidationErrors,
    deleteTodo
);

export default router;