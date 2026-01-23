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

Create an admin user
-------------------

A small helper script is provided to create an admin user in the database using the existing `src/models/user` code.

Usage (example):

```bash
cd backend-express
# create user with login 'admin1337' and password 'admin1337'
node scripts/create_admin.js admin1337 admin1337
```

Or set environment variables and run without args:

```bash
export ADMIN_LOGIN=admin1337
export ADMIN_PASSWORD=admin1337
node scripts/create_admin.js
```

The script will exit with code 0 if the user already exists or after successful creation, and non-zero on error.

Deploying to Vercel
-------------------

You can deploy the `backend-express` folder to Vercel as a separate project. The repository includes a small adapter at `api/index.js` which forwards all requests to the existing Express `app`.

Steps:

```bash
# from repository root
cd backend-express
# log in to vercel and link/create a project
vercel login
vercel init      # if you need to create a new project
vercel           # follow prompts to deploy
```

Configure environment variables in the Vercel dashboard (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_LOGIN`, etc.).

Notes:
- The `vercel.json` routes all requests to `api/index.js`, which calls the Express app. Adjust memory/timeouts in the Vercel project settings if needed.

Automated deploy + migrations (GitHub Actions)
--------------------------------------------

A workflow is included at `.github/workflows/redeploy-backend.yml` to run database migrations and deploy the `backend-express` project to Vercel. It is intended to be triggered manually from the GitHub Actions UI (`workflow_dispatch`).

Required GitHub repository secrets:
- `DATABASE_URL` - the production Postgres connection string (used for migrations).
- `VERCEL_TOKEN` - a Vercel personal token with deploy permission.

How it works:
- The workflow checks out the repo, installs backend dependencies, runs `node src/db/migrate.js` with `DATABASE_URL` set from secrets, then runs `npx vercel --prod` using `VERCEL_TOKEN` to push a production deployment.

Important: Backup your production database before running the migrations. The workflow runs migrations non-interactively; ensure you have safe backups and the correct `DATABASE_URL` value in GitHub Secrets.
