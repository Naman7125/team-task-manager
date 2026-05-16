# Taskly - Project Documentation

## 1. Project Overview

**Taskly** is a full-stack team task management application where users can create projects, manage teams, assign tasks, and track work progress with role-based access control.

The project was built for the assignment requirement:

- Authentication with signup and login
- Project and team management
- Task creation, assignment, and status tracking
- Dashboard with task statistics, project status, overdue tasks, and due-soon work
- Role-based access control for `ADMIN` and `MEMBER`
- REST APIs with a real database
- Proper validations and relational data modeling
- Production deployment

The application is separated into two independent apps:

- `frontend` - React/TanStack Start application deployed on Vercel
- `backend` - Express/TypeScript REST API deployed on Railway

## 2. Live Deployment

### Frontend

- **Platform:** Vercel
- **Public URL:** https://taskly-naman.vercel.app
- **Project name on Vercel:** `taskly`

### Backend

- **Platform:** Railway
- **Public API URL:** https://backend-production-3cdb3.up.railway.app
- **Health Check:** https://backend-production-3cdb3.up.railway.app/health

### Database

- **Platform:** Railway
- **Database:** MySQL
- **Access:** Backend connects through Railway environment variable `DATABASE_URL`

## 3. GitHub Repository

- **Repository:** https://github.com/Naman7125/team-task-manager
- **Main branch:** `main`

The repository name is still `team-task-manager`, but the product/app name is **Taskly**.

## 4. Demo Credentials

Use these accounts to test the deployed application:

### Admin User

- **Email:** `admin@teamtaskmanager.demo`
- **Password:** `TeamTask@2026`

### Member User

- **Email:** `member@teamtaskmanager.demo`
- **Password:** `TeamTask@2026`

The demo database also contains a sample project and task so the dashboard is not empty.

## 5. Core Features

### Authentication

- User signup
- User login
- JWT-based authentication
- Passwords hashed with bcrypt
- Authenticated user profile endpoint

### Project Management

- Create projects
- View project list
- View project details
- Update project information
- Delete projects
- Track project status

### Team Management

- Add users to a project by email
- Assign project roles
- View project members
- Change member roles
- Remove members
- Prevent removing or demoting the last project admin

### Task Management

- Create project tasks
- Assign tasks to project members
- Set task priority
- Set task status
- Set due dates
- Update tasks
- Delete tasks
- Filter tasks by status, priority, assignee, and overdue state

### Dashboard

- Total projects
- Total tasks
- Task status breakdown
- Overdue task count
- Due-soon task count
- Recent/latest tasks

## 6. Role-Based Access Control

Taskly uses project-level roles.

### Admin

Admins can:

- Create projects
- Edit project details
- Delete projects
- Add project members
- Remove project members
- Change member roles
- Create tasks
- Assign tasks
- Edit all task fields
- Delete tasks

### Member

Members can:

- View projects where they are added
- View project members
- View project tasks
- Update only the status of tasks assigned to them

Members cannot:

- Create projects globally from member-only access
- Edit project settings
- Add or remove members
- Create tasks
- Reassign tasks
- Delete tasks

## 7. Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT authentication
- bcrypt password hashing
- Zod validation
- Helmet security headers
- CORS configuration
- Compression
- Express rate limiting
- Morgan request logging

### Frontend

- React
- TanStack Start
- TanStack Router
- TanStack Query
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Zod
- Nitro for Vercel deployment support

## 8. Folder Structure

```text
Team Task Manager/
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      app.ts
      server.ts
      routes/
      schemas/
      middleware/
      lib/
    package.json
    railway.json
    .env.example

  frontend/
    src/
      api/
      components/
      hooks/
      routes/
    package.json
    vite.config.ts
    railway.json
    .env.example

  TASKLY_PROJECT_DOCUMENTATION.md
```

## 9. Backend API Summary

Backend base URL:

```text
https://backend-production-3cdb3.up.railway.app/api
```

### Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/auth/me` | Get current authenticated user |

### Dashboard Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Get dashboard metrics |

### Project Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/projects` | List projects for current user |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:id` | Get project details |
| `PATCH` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |
| `GET` | `/projects/:id/members` | List project members |
| `POST` | `/projects/:id/members` | Add member by email |
| `PATCH` | `/projects/:id/members/:userId` | Update member role |
| `DELETE` | `/projects/:id/members/:userId` | Remove project member |

### Task Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/projects/:id/tasks` | List project tasks |
| `POST` | `/projects/:id/tasks` | Create task |
| `GET` | `/tasks/:taskId` | Get task details |
| `PATCH` | `/tasks/:taskId` | Update task |
| `DELETE` | `/tasks/:taskId` | Delete task |

### User Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users?search=` | Search users for team management |

## 10. Environment Variables

Environment files are **not committed** to GitHub. Use `.env.example` files as templates.

### Backend `.env`

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/team_task_manager"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173,http://localhost:4173,http://localhost:3000"
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Production Values

On production:

- Backend `DATABASE_URL` is stored inside Railway.
- Backend `JWT_SECRET` is stored inside Railway.
- Backend `CORS_ORIGIN` is set to:

```text
https://taskly-naman.vercel.app
```

- Frontend `VITE_API_BASE_URL` is set in Vercel to:

```text
https://backend-production-3cdb3.up.railway.app
```

## 11. Local Development

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## 12. Build and Validation Commands

### Backend

```bash
cd backend
npm run typecheck
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## 13. Deployment Details

### Backend Deployment on Railway

Railway service:

- `backend`

Backend start command:

```bash
npm run db:deploy && npm start
```

This command:

1. Applies Prisma migrations to Railway MySQL.
2. Starts the compiled Express server.

### Frontend Deployment on Vercel

Vercel project:

```text
taskly
```

Frontend build command:

```bash
npm run build
```

TanStack Start is deployed on Vercel using Nitro integration.

## 14. Database Design Summary

Main database entities:

- `User`
- `Project`
- `ProjectMembership`
- `Task`

Important relationships:

- A user can own many projects.
- A project has many members through `ProjectMembership`.
- A membership stores the user's project role: `ADMIN` or `MEMBER`.
- A project has many tasks.
- A task can be assigned to a project member.
- A task stores creator, assignee, status, priority, and due date.

## 15. Security and Quality Practices

Implemented practices:

- Password hashing with bcrypt
- JWT authentication
- Protected routes with auth middleware
- Role checks on project/task actions
- Request validation with Zod
- Centralized error handling
- Rate limiting
- Helmet security middleware
- CORS locked to production frontend
- Environment secrets kept out of Git
- Prisma migrations for database changes
- Separate frontend/backend deployment
- No mock data fallback in production frontend
- No Lovable branding/traces left in the app source

## 16. Submission Checklist

- **Live URL:** https://taskly-naman.vercel.app
- **Backend URL:** https://backend-production-3cdb3.up.railway.app
- **GitHub Repo:** https://github.com/Naman7125/team-task-manager
- **README / Documentation:** This file
- **Database:** Railway MySQL
- **Deployment:** Frontend on Vercel, backend on Railway
- **Demo Admin:** `admin@teamtaskmanager.demo` / `TeamTask@2026`
- **Demo Member:** `member@teamtaskmanager.demo` / `TeamTask@2026`

## 17. Important Notes

- Do not commit `.env` files.
- Use Railway/Vercel dashboards to manage production environment variables.
- If the frontend URL changes, update backend `CORS_ORIGIN` on Railway.
- If the backend URL changes, update frontend `VITE_API_BASE_URL` on Vercel.
- The exact `taskly.vercel.app` alias was already taken, so the deployed Taskly URL is `taskly-naman.vercel.app`.
