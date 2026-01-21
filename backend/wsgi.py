"""WSGI/ASGI entrypoint helper.

Provides a simple module path `backend.wsgi:app` or `backend.app:app` for servers.
"""
from .app import app

if __name__ == '__main__':
    # quick local run helper
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
