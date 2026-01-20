import os
import asyncio
import asyncpg

async def main():
    url = os.environ.get('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/trecker_time'
    # convert sqlalchemy+asyncpg url if present
    url = url.replace('postgresql+asyncpg://','postgresql://')
    print('Connecting to', url)
    conn = await asyncpg.connect(dsn=url)
    try:
        print('Applying migration: add avatar_url if missing')
        await conn.execute("ALTER TABLE preacher ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;")
        print('Migration applied')
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
