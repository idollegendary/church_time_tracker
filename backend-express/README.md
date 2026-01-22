# Trecker Time — Express backend (initial scaffold)

This folder contains a starter Express implementation mirroring the FastAPI API surface.

Quick start (local, Node.js required):

```bash
cd backend-express
npm install
npm start
```

Environment variables: copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `ADMIN_LOGIN`.

Notes:
- Current implementation uses in-memory stores for users and sessions for quick testing.
- Next steps: wire up PostgreSQL (`pg`), implement persistent models and migrations (Knex/TypeORM), port analytics SQL queries.
 - Current implementation uses in-memory stores for users, sessions, preachers and churches for quick testing.
 - Next steps: wire up PostgreSQL (`pg`), implement persistent models and migrations (Knex/TypeORM), port analytics SQL queries.

Run locally (development):

```bash
cp .env.example .env
npm install
npm run dev
```

To enable persistent DB wiring, set `DATABASE_URL` in `.env` and implement models in `src/models/` using your chosen ORM. See `src/db/index.js` for a simple `pg` pool helper.
Run migrations to create tables:

```bash
npm run migrate
```

After migrations, start the server and run smoke tests as described above.
