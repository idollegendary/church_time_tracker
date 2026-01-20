FROM python:3.11-slim
WORKDIR /app
# requirements.txt is in the build context (./backend)
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install -r /app/requirements.txt
COPY . /app
ENV PYTHONPATH=/app
EXPOSE 8001
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8001"]
