# MindBridge SaaS Refactor

This folder contains the refactored MindBridge mental health SaaS platform:

- `apps/web`: Next.js frontend for public discovery, auth, and dashboards.
- `apps/api`: NestJS backend with JWT auth, RBAC, and Prisma.
- `packages/shared`: Shared domain types/constants used by both apps.
- `docker-compose.yml`: Local PostgreSQL database.

## Local Setup

1. Copy `.env.example` to `.env` and keep the same values for local development.
2. Start Postgres with `docker compose up -d`.
3. Install dependencies from this folder with `npm install`.
4. Generate Prisma Client with `npm run db:generate`.
5. Apply the database schema with `npm run db:migrate`.
6. Seed demo data with `npm run db:seed`.
7. Run both apps with `npm run dev`.

The web app runs on `http://localhost:3000`; the API runs on `http://localhost:4000`.

## Demo Accounts

- Client: `client@mindbridge.lk` / `MindBridge123!`
- Psychologist: `psychologist@mindbridge.lk` / `MindBridge123!`
- Psychiatrist: `psychiatrist@mindbridge.lk` / `MindBridge123!`
- Admin: `admin@mindbridge.lk` / `MindBridge123!`

## Architecture Notes

The original app mixed frontend, API routes, MongoDB models, and realtime concerns in one Next.js project. This refactor separates responsibilities:

- Next.js owns UI, routing, and client state.
- NestJS owns business logic, authentication, RBAC, and REST APIs.
- PostgreSQL stores normalized clinical, scheduling, safety, and content data.
- Prisma defines the database schema and creates a typed persistence layer.
