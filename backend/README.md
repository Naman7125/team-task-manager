# Taskly Backend

REST API backend for a team task manager with authentication, projects, project-level roles, task assignment, status tracking, and dashboard metrics.

## Tech Stack

- Node.js + Express + TypeScript
- MySQL + Prisma ORM
- JWT auth + bcrypt password hashing
- Zod request validation
- Helmet, CORS, compression, rate limiting

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Set `DATABASE_URL` and a strong `JWT_SECRET` in `.env` before running migrations.

For MySQL, `DATABASE_URL` should look like:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/team_task_manager"
```

## Railway Deployment

1. Create a Railway project and add a MySQL database.
2. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
3. Use these commands:
   - Build: `npm run build`
   - Start: `npm run db:deploy && npm start`

## API Summary

Base URL: `/api`

### Auth

- `POST /auth/signup` — create account
- `POST /auth/login` — login and receive JWT
- `GET /auth/me` — current user

Use the token as:

```http
Authorization: Bearer <token>
```

### Projects

- `GET /projects` — list projects where the user is a member
- `POST /projects` — create project; creator becomes project admin
- `GET /projects/:id` — project details
- `PATCH /projects/:id` — admin only
- `DELETE /projects/:id` — admin only
- `GET /projects/:id/members` — list members
- `POST /projects/:id/members` — admin adds user by email
- `PATCH /projects/:id/members/:userId` — admin changes member role
- `DELETE /projects/:id/members/:userId` — admin removes member

### Tasks

- `GET /projects/:id/tasks` — list project tasks
- `POST /projects/:id/tasks` — project admin creates task
- `GET /tasks/:taskId` — task details
- `PATCH /tasks/:taskId` — admin updates task; assigned member can update only status
- `DELETE /tasks/:taskId` — admin only

### Dashboard

- `GET /dashboard` — project count, task totals, status counts, overdue and due-soon counts, latest tasks

## Role Rules

- Each project has `ADMIN` and `MEMBER` roles.
- Project creator is automatically an `ADMIN`.
- Admins manage project details, members, and tasks.
- Members can view project data and update status only for tasks assigned to them.
- The API prevents removing or demoting the last project admin.
