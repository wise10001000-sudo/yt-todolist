# Database Module

This module handles PostgreSQL database connections for the yt-todolist application.

## Overview

The database module provides:
- Connection pooling using `pg-pool`
- Database initialization and health checks
- Graceful connection startup and shutdown
- Integration with health check endpoints

## Files

- `index.ts`: Main database connection logic with pool setup and connection management
- `health.ts`: Database health check functionality

## Configuration

Database configuration is loaded from environment variables via the config module:
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: yt_todolist)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: empty)

## Usage

### Initialize Database Connection
```typescript
import { initDatabase, closeDatabase } from './database';

// Initialize during application startup
await initDatabase();

// Close connections during shutdown
await closeDatabase();
```

### Check Database Health
```typescript
import { isDatabaseHealthy } from './database/health';

const healthy = await isDatabaseHealthy();
```

## Health Check Integration

The database health is integrated into the main health check endpoint at `/api/health`, which returns:
- `200 OK` when database is healthy
- `503 Service Unavailable` when database is unhealthy