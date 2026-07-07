# Cipher Backend MVP

A production-ready Express API built with TypeScript, PostgreSQL, Prisma ORM, and JWT authentication. This backend serves as the data persistence layer for the Cipher MVP dashboard, managing users, tasks, subtasks, and goals.

## Project Structure

```text
assignment5/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── goals.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── prisma.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── .env.example
└── README.md
```

## Setup & Installation

1. Prerequisites - Ensure you have the following installed:
   - Node.js (v18+)
   - Docker & Docker Compose

2. Environment Variables - Clone `.env.example` to create your local `.env` file:

   ```Bash
   cp .env.example .env
   ```

   Configure your database connection string and JWT secret key inside `.env`.

3. Start the Database -Run the PostgreSQL container via Docker Compose:

   ```Bash
   docker compose up -d
   ```

4. Run Migrations - Apply the Prisma schema to your database and generate the client:

   ```Bash
   npx prisma migrate dev --name init
   ```

5. Start the Application - Run the development server:
   ```Bash
   npm run dev
   ```
   The server will start running on http://localhost:5000.

## API Endpoints

1. Authentication (`src/routes/auth.ts`)
   - `POST /api/auth/register` - Register a new user account.
   - `POST /api/auth/login` - Authenticate user and receive a JWT token.
   - `GET /api/auth/me` - Fetch authenticated user profile data (Protected).

2. Tasks & Subtasks (`src/routes/tasks.ts`)
   - `POST /api/tasks` - Create a task or subtask (Protected).
   - `GET /api/tasks` - Fetch all tasks for the logged-in user in a flat relational array (Protected).
   - `PATCH /api/tasks/:id` - Update title, deadlines, or completion status (Protected).
   - `DELETE /api/tasks/:id` - Cascades and removes tasks along with their subtasks (Protected).

3. Goal Tracker (`src/routes/goals.ts`)
   - `POST /api/goals` - Create a new goal metrics tracker (Protected).
   - `GET /api/goals` - Fetch all active goals for the user (Protected).
   - `PATCH /api/goals/:id` - Update goal values with enforced 0-100 value clamping (Protected).
   - `DELETE /api/goals/:id` - Delete an active goal tracker (Protected).

---
