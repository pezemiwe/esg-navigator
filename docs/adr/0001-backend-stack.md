# ADR-0001: Hono + Prisma as the API layer

## Status
Accepted

## Context
The app was 100% client-side (React + Zustand + localStorage). AI integration and real persistence required a server. Key constraints: TypeScript throughout, SQLite locally for zero-setup dev, Postgres in production without code changes, and the Vite dev proxy pattern already implied a local server on a separate port.

## Decision
Use Hono (@hono/node-server) as the HTTP framework and Prisma as the ORM. The server lives in `server/` as a separate workspace. `DATABASE_URL` in `.env` selects the database; switching from SQLite to Postgres requires only a connection string change and `prisma migrate deploy`.

## Consequences
- No Express/Fastify familiarity tax — Hono is lightweight and TypeScript-native
- Prisma migrations version-control the schema; `server/dev.db` is gitignored
- The server cannot be hosted on Render (static-only); production needs a separate compute target (Railway, Fly, Vercel serverless)
- `tsx watch` is the dev runner; no compiled output needed locally
