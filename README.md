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

This will start a Postgres container and the backend (available at `http://127.0.0.1:8001`).

To stop and remove containers:

```bash
docker-compose down
```

Deployment
----------

This project uses Vercel for the frontend and a separate service (e.g. Render or Railway) for the backend. The repository includes `vercel.json` (frontend) and `render.yaml` (backend template).

1) Push the repo to GitHub (replace with your remote):

```bash
git add .
git commit -m "prepare for deploy"
git branch -M main
git remote add origin git@github.com:<your-username>/<your-repo>.git
git push -u origin main
```

2) Vercel — frontend
- Import the GitHub repo in Vercel.
- Set Project Root to `frontend` (Vercel will use `vercel.json` to build the static site).
- Set Environment Variables in Vercel (Settings → Environment Variables):
	- `VITE_API_BASE` = `https://<your-backend-url>`

3) Render (or Railway) — backend
- Create a new Web Service on Render and connect your GitHub repo.
- Use Docker (the repo contains `backend/Dockerfile`) and point the service to the `main` branch.
- Set the following Environment variables in the service settings:
	- `DATABASE_URL` — Postgres connection string (create a managed Postgres on Render or elsewhere)
	- `JWT_SECRET` — a strong random secret
	- `ALLOW_ORIGINS` — e.g. `https://<your-vercel-domain>`
	- `ACCESS_TOKEN_EXPIRE_MINUTES` — optional
- Alternatively, use the provided `render.yaml` as a starting manifest (fill placeholders).

4) After backend is live, update `VITE_API_BASE` in Vercel to the backend URL and redeploy.

Notes:
- Never commit `.env` or secrets to git. Use Vercel/Render env settings.
- If you want, I can prepare a GitHub Actions workflow to build and test the project on push — tell me and I'll add it.
