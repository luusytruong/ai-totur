# Personalized Programming AI Tutor (PPAT) - Backend

Backend API for the Personalized Programming AI Tutor application. Built using Fastify, TypeScript, Drizzle ORM, PostgreSQL, and Redis.

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 15 (via Drizzle ORM)
- **Cache/Session**: Redis 7
- **Validation**: Zod
- **AI Integration**: OpenAI (Streaming via SSE)

---

## 🚀 Quick Start (Docker)

The easiest way to run the entire backend stack (API, PostgreSQL, Redis) is using Docker Compose.

1. Create a `.env` file based on the example:

   ```bash
   cp .env.example .env
   # Edit .env and supply your OPENAI_API_KEY
   ```

2. Start the services:

   ```bash
   docker compose up -d
   ```

   > The API will be available at `http://localhost:3000`.

3. Run Database Migrations:
   ```bash
   docker compose exec api pnpm db:push
   # Alternatively you can use drizzle-kit over the local connection:
   # pnpm db:push
   ```

---

## 🛠 Local Development (Without Docker for API)

If you prefer to run the Node server locally, you can start only the database and redis via docker, and the API via your local Node environment.

1. Start DB & Redis:

   ```bash
   docker compose up db redis -d
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Setup Database (Migrate):

   ```bash
   pnpm db:push
   ```

4. Run Development Server:
   ```bash
   pnpm dev
   ```

---

## 📁 Project Structure (Clean Architecture)

- `src/db`: Drizzle schemas and types.
- `src/plugins`: Fastify plugins (Auth, DB, Redis).
- `src/services`: System-level services (`ai.service.ts`, `code-runner.service.ts`).
- `src/modules`: Feature modules.
  - `auth/`: Login, Registration, Profile
  - `lessons/`: Manage and fetch lessons
  - `exercises/`: Submit code, Test Cases
  - `progress/`: Analytics and progress tracking
  - `chat/`: AI Tutor chat mechanism via Server-Sent Events

---

## Generating Migrations

If you make changes to `src/db/schema.ts`, generate a new migration:

```bash
pnpm db:generate
```

This drops the new `.sql` file in the `drizzle/` directory.

To apply it:

```bash
pnpm db:migrate
# or
pnpm db:push
```
