# Cipher MVP - Full-Stack Productivity Hub

An end-to-end full-stack web application designed for daily productivity. This project bridges a reactive, component-driven frontend architecture with a containerized PostgreSQL relational database layer using an Express/TypeScript server managed through Prisma ORM.

---

## ## System Features Mapping

The features map directly to the core architectural parts defined in the system specifications, supplemented by backend persistence layer expansions:

- **P0: Persistence & Security Layer:** Replaced temporary local browser arrays with global JWT state authorization. User profiles are securely verified with salted Bcrypt password encryption.
- **P1: Task Board (Flat Relational Model):** Implements relational mapping pairing individual tasks and subtasks using explicit parent ID attributes rather than nested objects. Tasks automatically evaluate status parameters (`Overdue`, `Today`, `Upcoming`, `No Date`, `Completed`) dynamically at render-time. Includes full task-to-subtask status sync propagation.
- **P2: Metric Goal Tracker:** Manages progress counters with stable layout order constraints (`orderBy`) to guarantee cards do not shift dynamically during update re-renders.
- **P3: Focus Countdown Timer:** Features a standard Pomodoro mechanism running downstream hooks that optionally associate countdown routines directly with a specific active task.
- **P4: Creative Mood Board (Backend Extension):** Extended from the local browser specification into a dedicated database-backed service. Mood board elements are mapped strictly user-wise, ensuring completely isolated, private workspaces across multiple devices.

---

## Technical Stack Architecture

- **Frontend:** React (Vite), Pure Inline CSS Layouts
- **Backend:** Node.js, Express, TypeScript
- **Database & Tools:** PostgreSQL, Docker, Prisma ORM, JSON Web Tokens (JWT), Bcrypt.js

---

## Development Environment Setup

### Prerequisites

- Node.js installed locally
- Docker Desktop running on your machine

### 1. Database Setup (Docker)

Navigate to the backend directory and launch your containerized instance:

```bash
cd backend
docker-compose up -d
```

### 2. Backend Initialization

Install all core runtime and development dependencies inside the backend workspace:

```Bash
npm install
```

Configure your local environment variables. Create a `.env` file inside the `backend/` folder based on `.env.example`:

```Plaintext
DATABASE_URL="postgresql://postgres:password@localhost:5432/cipher?schema=public"
JWT_SECRET="supersecretkeyforcipher"
PORT=5000
```

Generate the Prisma Client types and deploy your structural migrations to match the database state:

```Bash
npx prisma generate
npx prisma migrate dev --name init
```

Launch the development api worker:

```Bash
npm run dev
```

### 3. Frontend Initialization

Open a separate terminal workspace, navigate to the frontend directory, install local packages, and boot the Vite server asset loop:

```Bash
cd frontend
npm install
npm run dev
```

Open your browser to the address provided by Vite (typically http://localhost:5173) to view the application.

## Architectural Choices & Explanations

### Why User-Wise Moodboards?

In the initial frontend specification, mood board objects were stored in shared local device contexts. When transitioning to a multi-tenant backend infrastructure, we modified this constraint by implementing a private database relation model (`MoodItem`). This protects personal asset URLs and custom swatches, scoping query visibility strictly to the authenticated `userId` session.

## Stabilizing Component Layout Re-renders

By default, relational engines return rows in random order following updating mutations unless explicitly sorted. To prevent goal elements from shifting positions during progress counter updates, we enforced explicit data sequencing inside the relational fetching routines (`orderBy: { id: 'asc' }`). This anchors the layout structures firmly across active client re-renders.
