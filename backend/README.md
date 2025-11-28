# yt-todolist Backend API

Backend API server for yt-todolist application built with Node.js, Express, and TypeScript.

## Prerequisites 수정됨

- Node.js 20 LTS or higher
- PostgreSQL 16
- npm or yarn

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

- Database credentials
- JWT secrets (change in production!)
- CORS origin
- Port number

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

### Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the compiled JavaScript:

```bash
npm start
```

### Code Quality

Run ESLint:

```bash
npm run lint
```

Auto-fix ESLint issues:

```bash
npm run lint:fix
```

Check code formatting with Prettier:

```bash
npm run format:check
```

Format code with Prettier:

```bash
npm run format
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (env, database, etc.)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app configuration
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript (generated)
├── .env                # Environment variables (not in git)
├── .env.example        # Example environment variables
├── tsconfig.json       # TypeScript configuration
├── eslint.config.mjs   # ESLint configuration
└── package.json        # Project dependencies and scripts
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health check

### Root

- `GET /api/` - Hello World endpoint

## Environment Variables

| Variable                 | Description                          | Default                                                    |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| `NODE_ENV`               | Environment (development/production) | development                                                |
| `PORT`                   | Server port                          | 3000                                                       |
| `DATABASE_URL`           | PostgreSQL connection string         | postgresql://postgres:postgres@localhost:5432/yt_todolist  |
| `JWT_ACCESS_SECRET`      | JWT access token secret              | (change in production)                                     |
| `JWT_REFRESH_SECRET`     | JWT refresh token secret             | (change in production)                                     |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiration              | 15m                                                        |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration             | 7d                                                         |
| `CORS_ORIGIN`            | Allowed CORS origin                  | http://localhost:5173                                      |

### DATABASE_URL Format

The `DATABASE_URL` follows the standard PostgreSQL connection string format:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Examples:**
- Local: `postgresql://postgres:mypassword@localhost:5432/yt_todolist`
- Supabase: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Security**: Helmet, CORS
- **Validation**: express-validator
- **Code Quality**: ESLint, Prettier
- **Dev Tools**: ts-node, nodemon

## License

ISC
