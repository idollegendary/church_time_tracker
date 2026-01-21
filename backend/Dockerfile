FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build deps for packages like psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# Copy app sources
COPY . /app

# Ensure imports work
ENV PYTHONPATH=/app

# Expose default port (can be overridden by $PORT at runtime)
EXPOSE 8000

# Run uvicorn directly (use $PORT if provided by platform)
CMD ["sh", "-lc", "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
