# Project: yt-todolist

## Overview

The `yt-todolist` project is a web-based to-do list application with user authentication. It aims to provide efficient personal task management, integrating common events like national holidays. The application allows users to manage their own to-do items, track tasks based on start and end dates, and recover accidentally deleted items through a trash functionality.

## Key Features

*   **User Authentication**: Secure user registration and login with JWT-based authentication (Access and Refresh tokens).
*   **To-Do Management**: Users can create, view, update, and soft-delete their personal to-do items.
*   **Trash Functionality**: Deleted items are moved to a trash bin, allowing for restoration or permanent deletion.
*   **Public Holidays Integration**: National holidays are displayed alongside personal to-do items for comprehensive schedule management, and these public holidays cannot be modified by users.
*   **Date-Based Tracking**: To-do items include start and end dates for effective time management.

## Technology Stack

The project utilizes a modern full-stack web development technology stack:

### Frontend
*   **Framework**: React 18
*   **Language**: TypeScript 5.x
*   **State Management**: React Context API + Hooks
*   **Routing**: React Router v6
*   **HTTP Client**: Axios
*   **UI Library**: Material-UI (MUI) v5 or Tailwind CSS
*   **Form Management**: React Hook Form
*   **Date Handling**: date-fns
*   **Build Tool**: Vite

### Backend
*   **Runtime**: Node.js 20 LTS
*   **Framework**: Express.js 4.x
*   **Language**: TypeScript 5.x
*   **Authentication**: jsonwebtoken, bcrypt
*   **Validation**: express-validator or Zod
*   **Database Client**: node-postgres (pg)
*   **ORM**: Prisma (optional) or raw SQL
*   **Logging**: Winston or Pino
*   **Environment Variables**: dotenv

### Database
*   **Primary Database**: PostgreSQL 16

### Development Tools
*   **Language**: TypeScript 5.x
*   **Code Quality**: ESLint, Prettier
*   **Testing**: Jest (Unit/Integration), Supertest (API), Playwright (E2E)
*   **Version Control**: Git
*   **Package Manager**: npm or yarn
*   **API Documentation**: Swagger/OpenAPI (optional)

### Deployment & Infrastructure
*   **Containerization**: Docker
*   **CI/CD**: GitHub Actions

## Project Structure and Principles

Detailed project structure and design principles are documented in `docs/5-PROJECT_STRUCTURE.md`. Key principles include:

*   **Top-level Principles**: Single Responsibility, Separation of Concerns, Document-driven Development, MVP-first.
*   **Dependency/Layer Principles**: Unidirectional dependencies, Layered Architecture (Presentation, Application, Domain, Infrastructure).
*   **Code/Naming Principles**: TypeScript strict mode, consistent code style with Prettier/ESLint, clear and meaningful naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE).
*   **Test/Quality Principles**: Test Pyramid (Unit > Integration > E2E), minimum 80% unit test coverage, TDD encouraged, CI integration.
*   **Configuration/Security/Operations Principles**: Environment variables for configuration, strong security practices (bcrypt, JWT, HTTPS, SQLi/XSS/CSRF prevention), structured logging.
*   **Directory Structures**: Well-defined frontend (`frontend/`) and backend (`backend/`) directory structures reflecting the layered architecture and component-based design.

## How to Build and Run

(Placeholder: Detailed build and run instructions will be added here. Refer to `docs/5-PROJECT_STRUCTURE.md` for technology-specific details.)

*   **Frontend**:
    *   `cd frontend`
    *   `npm install` (or `yarn install`)
    *   `npm run dev` (or `yarn dev`)
*   **Backend**:
    *   `cd backend`
    *   `npm install` (or `yarn install`)
    *   `npm run start` (or `yarn start`)
*   **Database**: Ensure PostgreSQL is running and configured as per `.env` settings. Docker can be used for local setup.
*   **Tests**:
    *   `npm test` (or `yarn test`) for unit/integration tests.
    *   `npx playwright test` for E2E tests.

## Contribution Guidelines

(Placeholder: Specific contribution guidelines will be added here.)

*   Adhere to established coding standards (ESLint, Prettier).
*   Write comprehensive tests for new features and bug fixes.
*   Follow the Git workflow (feature branches, pull requests).
*   Ensure all CI/CD checks pass before merging.
