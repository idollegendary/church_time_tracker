from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://timedb_dfex_user:Y3jSsoU8DMnhsoT3SZpbjHoFJNmxQQYO@dpg-d5o1b375r7bs73cj1d60-a/timedb_dfex')

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session():
    async with AsyncSession(engine) as session:
        yield session
