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
