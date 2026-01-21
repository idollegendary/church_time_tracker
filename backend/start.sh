#!/usr/bin/env sh
set -eu

# start.sh - entrypoint for container platforms (Render/GCP/etc)
# Uses $PORT (provided by platform) and optional $HOST

: "${PORT:=8080}"
HOST="${HOST:-0.0.0.0}"

echo "Starting uvicorn on ${HOST}:${PORT}"

exec uvicorn backend.app:app --host "$HOST" --port "$PORT" --proxy-headers
