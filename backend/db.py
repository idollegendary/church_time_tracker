from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
import os
from dotenv import load_dotenv

load_dotenv()
# Prefer an asyncpg URL for SQLAlchemy async engine. If the env var is present but
# does not include the asyncpg driver, convert it automatically.
raw_url = os.getenv('DATABASE_URL', 'postgresql://timedb_dfex_user:Y3jSsoU8DMnhsoT3SZpbjHoFJNmxQQYO@dpg-d5o1b375r7bs73cj1d60-a/timedb_dfex')
if raw_url.startswith('postgresql+asyncpg://'):
    DATABASE_URL = raw_url
elif raw_url.startswith('postgresql://'):
    DATABASE_URL = raw_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
else:
    DATABASE_URL = raw_url

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session():
    async with AsyncSession(engine) as session:
        yield session
