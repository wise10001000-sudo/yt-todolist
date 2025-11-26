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