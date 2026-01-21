import os
import sys
import asyncio

import asyncpg


async def main():
    url = os.environ.get('DATABASE_URL')
    if not url:
        print('DATABASE_URL env var is not set', file=sys.stderr)
        sys.exit(2)

    # asyncpg expects a postgresql:// url (not postgresql+asyncpg://)
    dsn = url.replace('postgresql+asyncpg://', 'postgresql://')
    print('Connecting to', dsn)
    try:
        conn = await asyncpg.connect(dsn=dsn)
    except Exception as e:
        print('Failed to connect to database:', e, file=sys.stderr)
        sys.exit(1)

    try:
        print('Dropping and recreating public schema...')
        await conn.execute('DROP SCHEMA public CASCADE;')
        await conn.execute('CREATE SCHEMA public;')
        print('Schema reset complete')
    finally:
        await conn.close()


if __name__ == '__main__':
    asyncio.run(main())
