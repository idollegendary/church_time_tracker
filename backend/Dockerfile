FROM python:3.11-slim
WORKDIR /app

# Copy only what's needed from the repo to avoid context path issues
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

# Copy backend sources into /app/backend
COPY backend /app/backend

# Ensure Python can import the `backend` package
ENV PYTHONPATH=/app

# Let Render provide $PORT at runtime
EXPOSE 8080
CMD ["bash", "-lc", "export PYTHONPATH=/app && uvicorn backend.app:app --host 0.0.0.0 --port $PORT"]
