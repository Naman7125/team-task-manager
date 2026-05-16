# Taskly Frontend

React/TanStack frontend for the Taskly backend.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set the backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Backend Contract

The app talks to the Express API using `Authorization: Bearer <token>` after login.

Expected backend routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `PATCH /api/projects/:id/members/:userId`
- `DELETE /api/projects/:id/members/:userId`
- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `GET /api/users?search=`

## Validation

```bash
npm run build
npm run lint
```
