import asyncio
import sys
from sqlmodel import select

# make sure path resolution uses package imports

async def main(session_id):
    from backend.db import engine
    from backend.models import Session
    from sqlmodel.ext.asyncio.session import AsyncSession

    async with AsyncSession(engine) as session:
        q = select(Session).where(Session.id == session_id)
        res = await session.exec(q)
        obj = res.one_or_none()
        if not obj:
            print(f"NOT FOUND: session {session_id}")
            return 1
        await session.delete(obj)
        await session.commit()
        print(f"DELETED: session {session_id}")
        return 0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: delete_session.py <session_id>')
        sys.exit(2)
    sid = sys.argv[1]
    code = asyncio.run(main(sid))
    sys.exit(code)
