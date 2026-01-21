# Trecker Time (scaffold)

This repo contains an initial scaffold for the sermon tracking app (MVP).

Quick run (backend):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload --port 8000
```

Frontend: use Vite — install deps in `frontend/` and run `npm run dev`.

Next steps:

- Add Postgres integration and migrations.
- Add Auth (Auth0 / Firebase) and RBAC.
- Implement analytics endpoints and polish frontend.

Docker (Postgres + backend):

1. Copy `.env.example` to `backend/.env` and adjust `DATABASE_URL` if needed.

```bash
docker-compose up --build
```

Render deployment (recommended)
 - This repo contains `render.yaml` which configures a Python web service for the backend.
 - Before deploying to Render, add the following secrets/Environment Variables in the Render dashboard for the service:
	 - `DATABASE_URL` (your Postgres connection)
	 - `JWT_SECRET` (a strong random secret)
	 - Optionally set `ALLOW_ORIGINS` for CORS and `ALEMBIC_AUTO_MIGRATE=1` to run alembic migrations on start.

To deploy using the `render.yaml` manifest, push changes to the repo and Render will pick up the service.

Vercel (frontend) setup
- In your Vercel project settings, set Environment Variable `VITE_API_BASE` to your backend URL, e.g. `https://<your-render-backend>.onrender.com` or the Render service public URL.
- Redeploy the Vercel project after adding the env var so the frontend bundles with the correct API base.

Render (backend) quick checklist
- In Render dashboard for the `trecker-backend` service, add the following Environment variables / Secrets:
	- `DATABASE_URL` = your Render Postgres external URL (you provided: `postgresql://church_time_tracker_user:...@dpg-.../church_time_tracker`)
	- `JWT_SECRET` = a strong random secret (do not commit to repo)
	- `ALLOW_ORIGINS` = `https://church-time-tracker.vercel.app` (or add localhost for dev)
	- Optional: `ALEMBIC_AUTO_MIGRATE=1` and/or `APPLY_MIGRATIONS=1` if you want migrations run on start.



This will start a Postgres container and the backend (available at `http://127.0.0.1:8001`).

To stop and remove containers:

```bash
docker-compose down
```
