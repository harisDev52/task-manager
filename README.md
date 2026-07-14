# Task Manager

A simple full-stack task management app. Add, edit, complete, and delete tasks from a responsive UI backed by a REST API and a PostgreSQL database.

## Stack

- **Front-end:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Back-end:** Next.js Route Handlers (REST API)
- **Database:** PostgreSQL via Prisma ORM

## Setup Instructions

### Prerequisites

- Node.js 20+
- A running PostgreSQL server

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a database and copy the example env file:

```bash
createdb task_manager
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_manager?schema=public"
```

### 3. Run migrations

```bash
npx prisma migrate dev
```

This creates the `Task` table (see [Database Schema](#database-schema) below) and generates the Prisma Client.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

```prisma
model Task {
  id        String   @id @default(uuid())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Resulting table (PostgreSQL):

```sql
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
```

## REST API

| Method | Route             | Description       | Body                                   |
| ------ | ----------------- | ------------------ | --------------------------------------- |
| GET    | `/api/tasks`       | List all tasks     | —                                        |
| POST   | `/api/tasks`       | Create a task      | `{ "title": string }`                    |
| PATCH  | `/api/tasks/:id`   | Update a task      | `{ "title"?: string, "completed"?: boolean }` |
| DELETE | `/api/tasks/:id`   | Delete a task       | —                                        |

## Project Structure

```
src/
  app/
    api/tasks/route.ts          # GET, POST /api/tasks
    api/tasks/[id]/route.ts     # PATCH, DELETE /api/tasks/:id
    TaskApp.tsx                 # Client component: UI + state
    page.tsx                    # Renders TaskApp
    types.ts                    # Shared Task type
  lib/
    prisma.ts                   # Prisma client singleton
prisma/
  schema.prisma                 # Task model
  migrations/                  # SQL migration history
```
