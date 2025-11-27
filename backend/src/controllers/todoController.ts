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

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Todo"
 *               content:
 *                 type: string
 *                 example: "Todo description"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-25T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-30T23:59:59.999Z"
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todo:
 *                       $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
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
          startDate: safeDateToISOString(todo.start_date),
          endDate: safeDateToISOString(todo.end_date),
          status: todo.status,
          createdAt: safeDateToISOString(todo.created_at),
          updatedAt: safeDateToISOString(todo.updated_at)
        }
      },
      201
    );
  } catch (error) {
    console.error('Create todo error:', error);
    sendError(res, 'CREATE_TODO_ERROR', 'An error occurred while creating the todo', 500);
  }
};

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all active todos for the authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter todos with end_date >= startDate
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter todos with start_date <= endDate
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
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
      startDate: safeDateToISOString(todo.start_date),
      endDate: safeDateToISOString(todo.end_date),
      status: todo.status,
      createdAt: safeDateToISOString(todo.created_at),
      updatedAt: safeDateToISOString(todo.updated_at)
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

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get a specific todo by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todo:
 *                       $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
export const getTodoById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
      return;
    }

    const { id } = req.params;

    const query = `
      SELECT id, title, content, start_date, end_date, status, created_at, updated_at
      FROM todos
      WHERE id = $1 AND user_id = $2
    `;

    const result = await dbPool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Todo not found or you do not have permission to view it', 404);
      return;
    }

    const todo = result.rows[0];

    sendSuccess(res, {
      todo: {
        id: todo.id,
        title: todo.title,
        content: todo.content,
        startDate: safeDateToISOString(todo.start_date),
        endDate: safeDateToISOString(todo.end_date),
        status: todo.status,
        createdAt: safeDateToISOString(todo.created_at),
        updatedAt: safeDateToISOString(todo.updated_at)
      }
    });
  } catch (error) {
    console.error('Get todo by ID error:', error);
    sendError(res, 'GET_TODO_ERROR', 'An error occurred while fetching the todo', 500);
  }
};

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Todo Title"
 *               content:
 *                 type: string
 *                 example: "Updated content"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, trash]
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todo:
 *                       $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
export const updateTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const { title, content, startDate, endDate, status } = req.body;

      const updates: { [key: string]: any } = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (startDate !== undefined) updates.start_date = startDate;
      if (endDate !== undefined) updates.end_date = endDate;
      if (status !== undefined) updates.status = status;

      if (Object.keys(updates).length === 0) {
        sendError(res, 'BAD_REQUEST', 'No fields to update provided', 400);
        return;
      }

      const setClauses = Object.keys(updates).map((key, i) => `"${key}" = $${i + 1}`).join(', ');
      const values = Object.values(updates);

      const query = `
        UPDATE todos
        SET ${setClauses}, updated_at = NOW()
        WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
        RETURNING id, title, content, start_date, end_date, status, created_at, updated_at
      `;

      const result = await dbPool.query(query, [...values, id, userId]);

      if (result.rows.length === 0) {
        sendError(res, 'NOT_FOUND', 'Todo not found or you do not have permission to update it', 404);
        return;
      }

      const todo = result.rows[0];

      sendSuccess(res, {
        todo: {
          id: todo.id,
          title: todo.title,
          content: todo.content,
          startDate: safeDateToISOString(todo.start_date),
          endDate: safeDateToISOString(todo.end_date),
          status: todo.status,
          createdAt: safeDateToISOString(todo.created_at),
          updatedAt: safeDateToISOString(todo.updated_at),
        },
      });
    } catch (error) {
      console.error('Update todo error:', error);
      sendError(res, 'UPDATE_TODO_ERROR', 'An error occurred while updating the todo', 500);
    }
  };

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Move a todo to trash (soft delete)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo moved to trash successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "할일이 휴지통으로 이동되었습니다."
 *                     todo:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found or already deleted
 */
export const deleteTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
            return;
        }

        const { id } = req.params;

        const query = `
            UPDATE todos
            SET status = 'trash', deleted_at = NOW()
            WHERE id = $1 AND user_id = $2 AND status = 'active'
            RETURNING id, status, deleted_at
        `;

        const result = await dbPool.query(query, [id, userId]);

        if (result.rows.length === 0) {
            sendError(res, 'NOT_FOUND', 'Todo not found or already deleted', 404);
            return;
        }

        sendSuccess(res, {
            message: '할일이 휴지통으로 이동되었습니다.',
            todo: result.rows[0],
        });
    } catch (error) {
        console.error('Delete todo error:', error);
        sendError(res, 'DELETE_TODO_ERROR', 'An error occurred while deleting the todo', 500);
    }
};

/**
 * @swagger
 * /todos/trash:
 *   get:
 *     summary: Get all trashed todos
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of trashed todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
export const getTrashTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
      return;
    }

    const {
      page = 1,
      limit = 50,
    } = req.query;

    const pageInt = parseInt(page as string, 10);
    const limitInt = parseInt(limit as string, 10);
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT id, title, content, start_date, end_date, status, created_at, updated_at, deleted_at
      FROM todos
      WHERE user_id = $1 AND status = 'trash'
      ORDER BY deleted_at DESC
      LIMIT $2 OFFSET $3
    `;
    let countQuery = `
      SELECT COUNT(*)
      FROM todos
      WHERE user_id = $1 AND status = 'trash'
    `;
    const params: any[] = [userId, limitInt, offset];
    const countParams: any[] = [userId];

    const [totalResult, todosResult] = await Promise.all([
      dbPool.query(countQuery, countParams),
      dbPool.query(query, params),
    ]);

    const total = parseInt(totalResult.rows[0].count, 10);
    const todos = todosResult.rows.map(todo => ({
      id: todo.id,
      title: todo.title,
      content: todo.content,
      startDate: safeDateToISOString(todo.start_date),
      endDate: safeDateToISOString(todo.end_date),
      status: todo.status,
      createdAt: safeDateToISOString(todo.created_at),
      updatedAt: safeDateToISOString(todo.updated_at),
      deletedAt: safeDateToISOString(todo.deleted_at),
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
    console.error('Get trash todos error:', error);
    sendError(res, 'GET_TRASH_TODOS_ERROR', 'An error occurred while fetching trash todos', 500);
  }
};

// Helper function to safely convert dates to ISO string
const safeDateToISOString = (date: any): string | null => {
  if (date === null || date === undefined) {
    return null;
  }

  // Handle string dates
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }

  // Handle Date objects
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  // Handle other types that might be dates
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

/**
 * @swagger
 * /todos/trash/{id}/restore:
 *   post:
 *     summary: Restore a trashed todo
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "할일이 복원되었습니다."
 *                     todo:
 *                       $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found or already restored
 */
export const restoreTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
      return;
    }

    const { id } = req.params;

    const query = `
      UPDATE todos
      SET status = 'active', deleted_at = NULL, updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND status = 'trash'
      RETURNING id, title, content, start_date, end_date, status, created_at, updated_at, deleted_at
    `;

    const result = await dbPool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Todo not found or already restored', 404);
      return;
    }

    const todo = result.rows[0];

    sendSuccess(res, {
      message: '할일이 복원되었습니다.',
      todo: {
        id: todo.id,
        title: todo.title,
        content: todo.content,
        startDate: safeDateToISOString(todo.start_date),
        endDate: safeDateToISOString(todo.end_date),
        status: todo.status,
        createdAt: safeDateToISOString(todo.created_at),
        updatedAt: safeDateToISOString(todo.updated_at),
        deletedAt: safeDateToISOString(todo.deleted_at), // deleted_at will be null after restore
      }
    });
  } catch (error) {
    console.error('Restore todo error:', error);
    sendError(res, 'RESTORE_TODO_ERROR', 'An error occurred while restoring the todo', 500);
  }
};

/**
 * @swagger
 * /todos/trash/{id}:
 *   delete:
 *     summary: Permanently delete a trashed todo
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "할일이 영구적으로 삭제되었습니다."
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found or not in trash
 */
export const permanentlyDeleteTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
      return;
    }

    const { id } = req.params;

    const query = `
      DELETE FROM todos
      WHERE id = $1 AND user_id = $2 AND status = 'trash'
      RETURNING id
    `;

    const result = await dbPool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Todo not found or not in trash', 404);
      return;
    }

    sendSuccess(res, {
      message: '할일이 영구적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Permanently delete todo error:', error);
    sendError(res, 'PERMANENT_DELETE_TODO_ERROR', 'An error occurred while permanently deleting the todo', 500);
  }
};