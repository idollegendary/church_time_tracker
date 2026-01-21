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
CMD ["bash", "-lc", "export PYTHONPATH=/app && uvicorn backend.app:app --host 0.0.0.0 --port $PORT"]
