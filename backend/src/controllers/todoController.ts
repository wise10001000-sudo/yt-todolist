import { Response } from 'express';
import { dbPool } from '../database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper function to validate date range
const isValidDateRange = (startDate: Date | null, endDate: Date): boolean => {
  if (!endDate) return false; // endDate is required
  if (startDate && startDate > endDate) return false; // start date must be before or equal to end date
  return true;
};

export const createTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, startDate, endDate } = req.body;

    // Input validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      sendError(res, 'INVALID_TITLE', 'Title is required and must be a non-empty string', 400);
      return;
    }

    if (title.length > 200) {
      sendError(res, 'INVALID_TITLE', 'Title must be less than 200 characters', 400);
      return;
    }

    if (content && typeof content !== 'string') {
      sendError(res, 'INVALID_CONTENT', 'Content must be a string', 400);
      return;
    }

    if (content && content.length > 2000) {
      sendError(res, 'INVALID_CONTENT', 'Content must be less than 2000 characters', 400);
      return;
    }

    if (!endDate) {
      sendError(res, 'INVALID_END_DATE', 'End date is required', 400);
      return;
    }

    // Parse dates
    let parsedStartDate: Date | null = null;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        sendError(res, 'INVALID_START_DATE', 'Start date is invalid', 400);
        return;
      }
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      sendError(res, 'INVALID_END_DATE', 'End date is invalid', 400);
      return;
    }

    // Validate date range (BR-005)
    if (!isValidDateRange(parsedStartDate, parsedEndDate)) {
      sendError(res, 'INVALID_DATE_RANGE', 'Start date must be before or equal to end date', 400);
      return;
    }

    // Check if user is authenticated
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'User must be logged in to create a todo', 401);
      return;
    }

    const userId = req.user.userId;

    // Insert todo into database
    const query = `
      INSERT INTO todos (user_id, title, content, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, content, start_date, end_date, status, created_at, updated_at
    `;
    
    const result = await dbPool.query(query, [
      userId,
      title.trim(),
      content || null,
      parsedStartDate,
      parsedEndDate
    ]);

    const todo = result.rows[0];

    // Format the response to match PRD specification
    sendSuccess(
      res,
      {
        todo: {
          id: todo.id,
          title: todo.title,
          content: todo.content,
          startDate: todo.start_date ? new Date(todo.start_date).toISOString() : null,
          endDate: new Date(todo.end_date).toISOString(),
          status: todo.status,
          createdAt: new Date(todo.created_at).toISOString(),
          updatedAt: new Date(todo.updated_at).toISOString()
        }
      },
      201
    );
  } catch (error) {
    console.error('Create todo error:', error);
    sendError(res, 'CREATE_TODO_ERROR', 'An error occurred while creating the todo', 500);
  }
};

export const getTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
      return;
    }

    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    const pageInt = parseInt(page as string, 10);
    const limitInt = parseInt(limit as string, 10);
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT id, title, content, start_date, end_date, status, created_at, updated_at 
      FROM todos 
      WHERE user_id = $1 AND status = 'active'
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM todos 
      WHERE user_id = $1 AND status = 'active'
    `;
    const params: any[] = [userId];
    const countParams: any[] = [userId];

    let paramIndex = 2;
    if (startDate) {
      query += ` AND end_date >= $${paramIndex}`;
      countQuery += ` AND end_date >= $${paramIndex}`;
      params.push(startDate);
      countParams.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      query += ` AND start_date <= $${paramIndex}`;
      countQuery += ` AND start_date <= $${paramIndex}`;
      params.push(endDate);
      countParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitInt, offset);

    const [totalResult, todosResult] = await Promise.all([
      dbPool.query(countQuery, countParams),
      dbPool.query(query, params),
    ]);

    const total = parseInt(totalResult.rows[0].count, 10);
    const todos = todosResult.rows.map(todo => ({
      id: todo.id,
      title: todo.title,
      content: todo.content,
      startDate: todo.start_date ? new Date(todo.start_date).toISOString() : null,
      endDate: new Date(todo.end_date).toISOString(),
      status: todo.status,
      createdAt: new Date(todo.created_at).toISOString(),
      updatedAt: new Date(todo.updated_at).toISOString()
    }));

    sendSuccess(res, {
      todos,
      pagination: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(total / limitInt),
      },
    });
  } catch (error) {
    console.error('Get todos error:', error);
    sendError(res, 'GET_TODOS_ERROR', 'An error occurred while fetching todos', 500);
  }
};