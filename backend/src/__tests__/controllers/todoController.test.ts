import request from 'supertest';
import app from '../../app';
import { dbPool } from '../../database';

// Mock the database pool to avoid actual database calls during testing
jest.mock('../../database', () => ({
  dbPool: {
    query: jest.fn()
  }
}));

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
});