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

# Run uvicorn using shell form so $PORT works
CMD ["sh", "-lc", "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
FROM python:3.11-slim
WORKDIR /app

# Copy requirements from build context (backend/ as context root on Render)
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

# Copy entire build context into /app
COPY . /app

# Ensure Python can import the `backend` package
ENV PYTHONPATH=/app

# Let Render provide $PORT at runtime
EXPOSE 8080
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
