#!/bin/bash

# Create GitHub labels for the yt-todolist project

echo "Creating GitHub labels..."

# Type labels
gh label create "database" --description "Database-related tasks" --color "0E8A16" --force
gh label create "backend" --description "Backend API and services" --color "1D76DB" --force
gh label create "frontend" --description "Frontend UI and components" --color "5319E7" --force
gh label create "infra" --description "Infrastructure and DevOps" --color "D93F0B" --force
gh label create "test" --description "Testing tasks" --color "FBCA04" --force
gh label create "docs" --description "Documentation" --color "0075CA" --force

# Area labels
gh label create "authentication" --description "User authentication and authorization" --color "C2E0C6" --force
gh label create "todo-crud" --description "Todo CRUD operations" --color "BFD4F2" --force
gh label create "trash" --description "Trash/restore functionality" --color "D4C5F9" --force
gh label create "holiday" --description "Public holiday features" --color "FEF2C0" --force
gh label create "calendar" --description "Calendar integration" --color "C5DEF5" --force
gh label create "deployment" --description "Deployment and hosting" --color "F9D0C4" --force
gh label create "monitoring" --description "Monitoring and logging" --color "BFD4F2" --force
gh label create "backup" --description "Backup and recovery" --color "C2E0C6" --force

# Complexity labels
gh label create "complexity: low" --description "Low complexity task" --color "D4EDDA" --force
gh label create "complexity: medium" --description "Medium complexity task" --color "FFF3CD" --force
gh label create "complexity: high" --description "High complexity task" --color "F8D7DA" --force

# Priority labels
gh label create "P0" --description "Priority 0 - Critical (MVP)" --color "B60205" --force
gh label create "P1" --description "Priority 1 - Important (Enhancement)" --color "D93F0B" --force
gh label create "P2" --description "Priority 2 - Nice to have (Polish)" --color "FBCA04" --force

# Additional area labels
gh label create "api" --description "API endpoints" --color "BFD4F2" --force
gh label create "ui" --description "User interface" --color "D4C5F9" --force
gh label create "security" --description "Security-related" --color "B60205" --force
gh label create "performance" --description "Performance optimization" --color "FBCA04" --force
gh label create "accessibility" --description "Accessibility (a11y)" --color "0E8A16" --force
gh label create "setup" --description "Project setup and configuration" --color "C2E0C6" --force
gh label create "middleware" --description "Middleware components" --color "BFD4F2" --force
gh label create "types" --description "TypeScript types" --color "5319E7" --force
gh label create "state-management" --description "State management" --color "D4C5F9" --force
gh label create "routing" --description "Routing configuration" --color "FEF2C0" --force
gh label create "components" --description "Reusable components" --color "C5DEF5" --force
gh label create "modal" --description "Modal/dialog components" --color "F9D0C4" --force
gh label create "forms" --description "Form components and validation" --color "BFD4F2" --force
gh label create "dashboard" --description "Dashboard features" --color "C2E0C6" --force
gh label create "responsive" --description "Responsive design" --color "D4C5F9" --force
gh label create "mobile" --description "Mobile optimization" --color "FEF2C0" --force
gh label create "error-handling" --description "Error handling" --color "F8D7DA" --force
gh label create "loading" --description "Loading states" --color "FFF3CD" --force
gh label create "ux" --description "User experience" --color "C5DEF5" --force
gh label create "animation" --description "Animations and transitions" --color "D4C5F9" --force
gh label create "a11y" --description "Accessibility" --color "0E8A16" --force
gh label create "optimization" --description "Code optimization" --color "FBCA04" --force
gh label create "docker" --description "Docker configuration" --color "1D76DB" --force
gh label create "ci-cd" --description "CI/CD pipeline" --color "0E8A16" --force
gh label create "github-actions" --description "GitHub Actions" --color "C2E0C6" --force
gh label create "production" --description "Production environment" --color "B60205" --force
gh label create "logging" --description "Logging system" --color "BFD4F2" --force
gh label create "health-check" --description "Health check endpoints" --color "D4EDDA" --force
gh label create "integration" --description "Integration tests" --color "FBCA04" --force
gh label create "unit" --description "Unit tests" --color "FFF3CD" --force
gh label create "e2e" --description "End-to-end tests" --color "F8D7DA" --force
gh label create "playwright" --description "Playwright testing" --color "5319E7" --force
gh label create "cross-browser" --description "Cross-browser compatibility" --color "C5DEF5" --force
gh label create "compatibility" --description "Compatibility testing" --color "FEF2C0" --force
gh label create "load-testing" --description "Load and performance testing" --color "D93F0B" --force
gh label create "user-guide" --description "User documentation" --color "0075CA" --force
gh label create "developer-guide" --description "Developer documentation" --color "1D76DB" --force
gh label create "schema" --description "Database schema" --color "0E8A16" --force
gh label create "seed-data" --description "Seed data" --color "C2E0C6" --force
gh label create "axios" --description "Axios HTTP client" --color "5319E7" --force
gh label create "token-refresh" --description "Token refresh mechanism" --color "BFD4F2" --force
gh label create "logout" --description "Logout functionality" --color "C2E0C6" --force
gh label create "dependencies" --description "Dependencies management" --color "D4C5F9" --force
gh label create "typescript" --description "TypeScript" --color "1D76DB" --force

echo "✅ All labels created successfully!"
