
#!/bin/sh
#!/bin/sh
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
	echo "Could not find application module (neither /app/backend nor /app/app.py present)" 1>&2
	exit 1
fi

echo "Starting uvicorn on ${HOST}:${PORT} (module=${MODULE})"

# Optionally run alembic migrations if requested
if [ "${ALEMBIC_AUTO_MIGRATE:-0}" = "1" ] || [ "${ALEMBIC_AUTO_MIGRATE:-}" = "true" ]; then
	if [ -f /app/alembic.ini ]; then
		echo "Running alembic upgrade head"
		cd /app
		alembic upgrade head || (echo "alembic upgrade failed" 1>&2 && exit 1)
	else
		echo "alembic.ini not found, skipping migrations"
	fi
fi

# Run any simple apply_migrations script if present (non-destructive small SQL patches)
if [ "${APPLY_MIGRATIONS:-0}" = "1" ] || [ "${APPLY_MIGRATIONS:-}" = "true" ]; then
	if [ -f /app/apply_migrations.py ]; then
		echo "Running apply_migrations.py"
		cd /app
		python apply_migrations.py || (echo "apply_migrations failed" 1>&2 && exit 1)
	else
		echo "apply_migrations.py not found, skipping"
	fi
fi

exec uvicorn ${MODULE}:app --host "${HOST}" --port "${PORT}" --proxy-headers
