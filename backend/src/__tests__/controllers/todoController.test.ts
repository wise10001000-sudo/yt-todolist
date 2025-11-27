import request from 'supertest';
import app from '../../app';
import { dbPool } from '../../database';

// Mock the database pool to avoid actual database calls during testing
jest.mock('../../database', () => ({
  dbPool: {
    query: jest.fn()
  }
}));

// Mock the auth middleware to simulate a valid authenticated user
jest.mock('../../middleware/auth', () => {
  const actualAuth = jest.requireActual('../../middleware/auth');
  const actualUtils = jest.requireActual('../../utils/response');
  return {
    ...actualAuth,
    authenticateToken: (req: any, res: any, next: any) => {
      // For testing purposes, if there's no authorization header, return 401
      // Otherwise, simulate an authenticated user
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return actualUtils.sendError(res, 'NO_TOKEN', 'Access token is required', 401);
      }

      // For tests, just add the mock user
      req.user = { userId: 'test-user-id', email: 'test@example.com' };
      next();
    }
  };
});

describe('Todo Controller', () => {
  // Get reference to the mocked query function
  const mockQuery = (dbPool.query as jest.MockedFunction<any>);

  describe('POST /api/todos', () => {
    const endpoint = '/api/todos';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create a new todo with valid inputs', async () => {
      const newTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        startDate: '2025-11-25T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      const mockCreatedTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: newTodo.title,
        content: newTodo.content,
        start_date: newTodo.startDate,
        end_date: newTodo.endDate,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock successful todo creation
      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedTodo] });

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token') // Mock auth middleware adds user
        .send(newTodo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todo.title).toBe(newTodo.title);
      expect(response.body.data.todo.content).toBe(newTodo.content);
      expect(response.body.data.todo.startDate).toBe(newTodo.startDate);
      expect(response.body.data.todo.endDate).toBe(newTodo.endDate);
      expect(response.body.data.todo.status).toBe('active');

      // Verify that the query was called with the correct parameters
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        expect.arrayContaining([
          expect.anything(), // userId
          newTodo.title,
          newTodo.content,
          new Date(newTodo.startDate), // parsed start date
          new Date(newTodo.endDate)    // parsed end date
        ])
      );
    });

    it('should return 400 when title is missing', async () => {
      const invalidTodo = {
        content: 'Test Content',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when title is empty string', async () => {
      const invalidTodo = {
        title: '',
        content: 'Test Content',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when title is not a string', async () => {
      const invalidTodo = {
        title: 123,
        content: 'Test Content',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when title exceeds 200 characters', async () => {
      const invalidTodo = {
        title: 'a'.repeat(201),
        content: 'Test Content',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when endDate is missing', async () => {
      const invalidTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        startDate: '2025-11-25T00:00:00.000Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when startDate is after endDate', async () => {
      const invalidTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        startDate: '2025-12-30T23:59:59.999Z', // Later date
        endDate: '2025-11-30T23:59:59.999Z'   // Earlier date
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when endDate is invalid', async () => {
      const invalidTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        endDate: 'invalid-date-format'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should return 400 when startDate is invalid', async () => {
      const invalidTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        startDate: 'invalid-date-format',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(invalidTodo)
        .expect(400);
    });

    it('should handle database errors during todo creation', async () => {
      const newTodo = {
        title: 'Test Todo',
        content: 'Test Content',
        endDate: '2025-11-30T23:59:59.999Z'
      };

      // Mock database error
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .post(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .send(newTodo)
        .expect(500);
    });
  });

  describe('GET /api/todos/trash', () => {
    const endpoint = '/api/todos/trash';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully fetch trashed todos when authenticated', async () => {
      const mockTrashedTodos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Trashed Todo',
          content: 'Trashed Content',
          start_date: '2025-11-25T00:00:00.000Z',
          end_date: '2025-11-30T23:59:59.999Z',
          status: 'trash',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString()
        }
      ];

      const mockCount = { rows: [{ count: 1 }] };

      // Mock both count and todo queries
      mockQuery.mockResolvedValueOnce(mockCount).mockResolvedValueOnce({ rows: mockTrashedTodos });

      const response = await request(app)
        .get(`${endpoint}?page=1&limit=10`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todos).toHaveLength(1);
      expect(response.body.data.pagination.total).toBe(1);
      expect(response.body.data.todos[0].status).toBe('trash');
      expect(response.body.data.todos[0].deletedAt).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get(endpoint)
        .expect(401);
    });

    it('should handle database errors during fetch', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .get(endpoint)
        .set('Authorization', 'Bearer valid_token')
        .expect(500);
    });
  });

  describe('POST /api/todos/trash/:id/restore', () => {
    const endpoint = '/api/todos/trash/';
    const testId = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully restore a trashed todo', async () => {
      const mockRestoredTodo = {
        id: testId,
        title: 'Trashed Todo',
        content: 'Trashed Content',
        start_date: '2025-11-25T00:00:00.000Z',
        end_date: '2025-11-30T23:59:59.999Z',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRestoredTodo] });

      const response = await request(app)
        .post(`${endpoint}${testId}/restore`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('할일이 복원되었습니다.');
      expect(response.body.data.todo.status).toBe('active');
      expect(response.body.data.todo.deletedAt).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .post(`${endpoint}${testId}/restore`)
        .expect(401);
    });

    it('should return 404 when todo not found in trash', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .post(`${endpoint}${testId}/restore`)
        .set('Authorization', 'Bearer valid_token')
        .expect(404);
    });

    it('should return 400 when ID is not a valid UUID', async () => {
      await request(app)
        .post(`${endpoint}invalid-id/restore`)
        .set('Authorization', 'Bearer valid_token')
        .expect(400);
    });

    it('should handle database errors during restore', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .post(`${endpoint}${testId}/restore`)
        .set('Authorization', 'Bearer valid_token')
        .expect(500);
    });
  });

  describe('DELETE /api/todos/trash/:id', () => {
    const endpoint = '/api/todos/trash/';
    const testId = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully permanently delete a trashed todo', async () => {
      const mockDeletedTodo = {
        id: testId
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockDeletedTodo] });

      const response = await request(app)
        .delete(`${endpoint}${testId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('할일이 영구적으로 삭제되었습니다.');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .delete(`${endpoint}${testId}`)
        .expect(401);
    });

    it('should return 404 when todo not found in trash', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .delete(`${endpoint}${testId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(404);
    });

    it('should return 400 when ID is not a valid UUID', async () => {
      await request(app)
        .delete(`${endpoint}invalid-id`)
        .set('Authorization', 'Bearer valid_token')
        .expect(400);
    });

    it('should handle database errors during permanent deletion', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await request(app)
        .delete(`${endpoint}${testId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(500);
    });
  });
});