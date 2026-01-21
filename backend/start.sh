
#!/usr/bin/env sh
set -eu

# start.sh - entrypoint for container platforms (Render/GCP/etc)
# Uses $PORT (provided by platform) and optional $HOST

: "${PORT:=8080}"
HOST="${HOST:-0.0.0.0}"

# Ensure /app is on PYTHONPATH so modules can be imported regardless of build context
: "${PYTHONPATH:=/app}"
export PYTHONPATH

# Determine module path: prefer package `backend.app` if /app/backend exists
if [ -d /app/backend ]; then
	MODULE="backend.app"
elif [ -f /app/app.py ]; then
	MODULE="app"
else
	echo "Could not find application module (neither /app/backend nor /app/app.py present)" >&2
	exit 1
fi

echo "Starting uvicorn on ${HOST}:${PORT} (module=${MODULE})"

exec uvicorn ${MODULE}:app --host "$HOST" --port "$PORT" --proxy-headers
