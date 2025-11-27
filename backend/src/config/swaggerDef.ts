const packageJson = require('../../package.json');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'yt-todolist API documentation',
    version: packageJson.version,
    description: 'yt-todolist REST API documentation with Swagger',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api`,
      description: 'Development server',
    },
    {
      url: 'https://api.yt-todolist.com/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          username: {
            type: 'string',
            example: 'John Doe',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-27T00:00:00.000Z',
          },
        },
      },
      Todo: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          title: {
            type: 'string',
            maxLength: 200,
            example: 'Sample Todo',
          },
          content: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
            example: 'This is a sample todo description',
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2025-11-27T00:00:00.000Z',
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-30T23:59:59.999Z',
          },
          status: {
            type: 'string',
            enum: ['active', 'trash'],
            example: 'active',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-27T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-27T00:00:00.000Z',
          },
          deletedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 100,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 50,
          },
          totalPages: {
            type: 'integer',
            example: 2,
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerDef;