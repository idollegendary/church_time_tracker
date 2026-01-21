#!/usr/bin/env sh
set -e

# Ensure PYTHONPATH includes /app so both layouts work
export PYTHONPATH=/app

PORT=${PORT:-8080}

if [ -f /app/backend/app.py ]; then
  exec uvicorn backend.app:app --host 0.0.0.0 --port "$PORT"
elif [ -f /app/app.py ]; then
  exec uvicorn app:app --host 0.0.0.0 --port "$PORT"
else
  echo "Could not find application module (neither /app/backend/app.py nor /app/app.py)" >&2
  ls -la /app
  exit 1
fi
