from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timezone
import os
from datetime import timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.db import init_db, get_session
from backend.models import Session as SessionModel, SessionBase, Church, Preacher, User
from pydantic import BaseModel
import os
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy import func, text

# Auth config (env overrides)
SECRET_KEY = os.getenv('JWT_SECRET', 'dev-secret')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))

pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # JWT `exp` claim must be a numeric timestamp (seconds since epoch)
    to_encode.update({'exp': int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_id(user_id: str, db: AsyncSession):
    q = select(User).where(User.id == user_id)
    res = await db.exec(q)
    return res.one_or_none()

async def get_user_by_email(email: str, db: AsyncSession):
    q = select(User).where(User.email == email)
    res = await db.exec(q)
    return res.one_or_none()


async def get_user_by_login(login: str, db: AsyncSession):
    q = select(User).where(User.login == login)
    res = await db.exec(q)
    return res.one_or_none()

async def _get_authorization_header(request: Request):
    return request.headers.get('Authorization')


async def get_current_user(token: str = Depends(_get_authorization_header), db: AsyncSession = Depends(get_session)):
    # Expect header like: Bearer <token>
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authenticated')
    if token.startswith('Bearer '):
        token = token.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    user = await get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user

def require_admin(user: User = Depends(get_current_user)):
    if user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin required')
    return user

app = FastAPI(title="Trecker Time - backend (dev)")

# Development CORS: allow frontend dev servers to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/sessions", response_model=SessionModel)
async def create_session(payload: SessionBase, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    def _naive_utc(dt: Optional[datetime]):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt
        return dt.astimezone(timezone.utc).replace(tzinfo=None)

    s = SessionModel(**payload.dict())
    s.start_at = _naive_utc(s.start_at)
    s.end_at = _naive_utc(s.end_at)
    if s.start_at and s.end_at:
        s.duration_sec = int((s.end_at - s.start_at).total_seconds())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


@app.get("/api/sessions", response_model=List[SessionModel])
async def list_sessions(
    preacher_id: Optional[str] = None,
    from_: Optional[datetime] = None,
    to: Optional[datetime] = None,
    church_id: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
):
    clauses = []
    if preacher_id:
        clauses.append(SessionModel.preacher_id == preacher_id)
    if church_id:
        clauses.append(SessionModel.church_id == church_id)
    if from_:
        clauses.append(SessionModel.start_at >= from_)
    if to:
        clauses.append(SessionModel.start_at < to)

    # exclude sessions without start time for time-series
    clauses.append(SessionModel.start_at != None)

    if clauses:
        q = select(SessionModel).where(*clauses).order_by(SessionModel.created_at.desc())
    else:
        q = select(SessionModel).order_by(SessionModel.created_at.desc())

    result = await db.exec(q)
    items = result.all()
    return items


@app.post("/api/churches", response_model=Church)
async def create_church(payload: Church, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    db.add(payload)
    await db.commit()
    await db.refresh(payload)
    return payload

@app.get('/api/analytics/summary')
async def analytics_summary(from_: Optional[datetime] = None, to: Optional[datetime] = None, church_id: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    # totals per preacher
    clauses = []
    if church_id:
        clauses.append(SessionModel.church_id == church_id)
    if from_:
        clauses.append(SessionModel.start_at >= from_)
    if to:
        clauses.append(SessionModel.start_at < to)
    # exclude sessions without start time to match sessions listing
    clauses.append(SessionModel.start_at != None)

    q = select(SessionModel.preacher_id, func.sum(SessionModel.duration_sec).label('total_sec'), func.count(SessionModel.id).label('sessions_count'))
    if clauses:
        q = q.where(*clauses)
    q = q.group_by(SessionModel.preacher_id).order_by(func.sum(SessionModel.duration_sec).desc())
    res = await db.exec(q)
    rows = res.all()
    return [{'preacher_id': r[0], 'total_sec': int(r[1] or 0), 'sessions_count': int(r[2] or 0)} for r in rows]


@app.get('/api/analytics/time-series')
async def analytics_time_series(preacher_id: Optional[str] = None, from_: Optional[datetime] = None, to: Optional[datetime] = None, church_id: Optional[str] = None, granularity: str = 'day', db: AsyncSession = Depends(get_session)):
    # supports daily granularity for now
    if granularity != 'day':
        raise HTTPException(status_code=400, detail='only day granularity supported')

    clauses = []
    if preacher_id:
        clauses.append(SessionModel.preacher_id == preacher_id)
    if church_id:
        clauses.append(SessionModel.church_id == church_id)
    if from_:
        clauses.append(SessionModel.start_at >= from_)
    if to:
        clauses.append(SessionModel.start_at < to)

    # exclude sessions without start time
    clauses.append(SessionModel.start_at != None)

    # date_trunc('day', start_at) as text to avoid None isoformat issues
    day = func.to_char(func.date_trunc('day', SessionModel.start_at), 'YYYY-MM-DD').label('day')
    q = select(day, func.sum(SessionModel.duration_sec).label('total_sec'))
    if clauses:
        q = q.where(*clauses)
    q = q.group_by(day).order_by(day)
    res = await db.exec(q)
    rows = res.all()
    rows = [r for r in rows if r[0] is not None]
    return [{'day': r[0], 'total_sec': int(r[1] or 0)} for r in rows]


@app.get('/api/analytics/top')
async def analytics_top(limit: int = 10, from_: Optional[datetime] = None, to: Optional[datetime] = None, church_id: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    # top preachers by total speaking time
    clauses = []
    if church_id:
        clauses.append(SessionModel.church_id == church_id)
    if from_:
        clauses.append(SessionModel.start_at >= from_)
    if to:
        clauses.append(SessionModel.start_at < to)

    # exclude sessions without start time
    clauses.append(SessionModel.start_at != None)

    q = select(SessionModel.preacher_id, func.sum(SessionModel.duration_sec).label('total_sec'), func.count(SessionModel.id).label('sessions_count'))
    if clauses:
        q = q.where(*clauses)
    q = q.group_by(SessionModel.preacher_id).order_by(func.sum(SessionModel.duration_sec).desc()).limit(limit)
    res = await db.exec(q)
    rows = res.all()
    return [{'preacher_id': r[0], 'total_sec': int(r[1] or 0), 'sessions_count': int(r[2] or 0)} for r in rows]


@app.get('/api/analytics/shortest')
async def analytics_shortest(limit: int = 10, church_id: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    # shortest sessions by duration
    clauses = [SessionModel.duration_sec != None]
    if church_id:
        clauses.append(SessionModel.church_id == church_id)

    q = select(SessionModel).where(*clauses).order_by(SessionModel.duration_sec.asc()).limit(limit)
    res = await db.exec(q)
    rows = res.all()
    # return minimal session info
    return [{'id': r.id, 'preacher_id': r.preacher_id, 'duration_sec': r.duration_sec, 'start_at': (r.start_at.isoformat() if r.start_at else None), 'end_at': (r.end_at.isoformat() if r.end_at else None)} for r in rows]


@app.get('/api/analytics/overlap')
async def analytics_overlap(limit: int = 50, church_id: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    # find pairs of sessions that overlap and their overlap seconds
    table = SessionModel.__table__.name
    where_clause = ""
    if church_id:
        where_clause = f"AND s1.church_id = :church_id AND s2.church_id = :church_id"

    sql = f"""
    SELECT s1.id as session_a, s2.id as session_b,
      GREATEST(0, EXTRACT(EPOCH FROM LEAST(s1.end_at, s2.end_at) - GREATEST(s1.start_at, s2.start_at)))::int as overlap_sec
    FROM {table} s1
    JOIN {table} s2 ON s1.id < s2.id
    WHERE s1.end_at IS NOT NULL AND s2.end_at IS NOT NULL
      AND s1.start_at < s2.end_at AND s2.start_at < s1.end_at
      {where_clause}
    ORDER BY overlap_sec DESC
    LIMIT :limit
    """

    params = {"limit": limit}
    if church_id:
        params["church_id"] = church_id

    try:
        res = await db.execute(text(sql), params)
        rows = res.fetchall()
        return [{'session_a': r[0], 'session_b': r[1], 'overlap_sec': int(r[2] or 0)} for r in rows]
    except Exception as e:
        # return error detail for dev debugging
        return {'error': str(e)}


@app.get("/api/churches", response_model=List[Church])
async def list_churches(db: AsyncSession = Depends(get_session)):
    q = select(Church).order_by(Church.created_at.desc())
    res = await db.exec(q)
    return res.all()


@app.post("/api/preachers", response_model=Preacher)
async def create_preacher(payload: Preacher, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    db.add(payload)
    await db.commit()
    await db.refresh(payload)
    return payload


@app.get("/api/preachers", response_model=List[Preacher])
async def list_preachers(church_id: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    if church_id:
        q = select(Preacher).where(Preacher.church_id == church_id)
    else:
        q = select(Preacher)
    res = await db.exec(q)
    return res.all()


@app.get("/api/churches/{church_id}/preachers", response_model=List[Preacher])
async def get_church_preachers(church_id: str, db: AsyncSession = Depends(get_session)):
    q = select(Preacher).where(Preacher.church_id == church_id)
    res = await db.exec(q)
    return res.all()


@app.patch("/api/preachers/{preacher_id}", response_model=Preacher)
async def update_preacher(preacher_id: str, payload: Preacher, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    q = select(Preacher).where(Preacher.id == preacher_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="preacher not found")
    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(obj, k, v)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_session), admin: User = Depends(require_admin)):
    q = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="session not found")
    await db.delete(obj)
    await db.commit()
    return {"status": "ok"}


@app.delete("/api/preachers/{preacher_id}")
async def delete_preacher(preacher_id: str, db: AsyncSession = Depends(get_session), admin: User = Depends(require_admin)):
    q = select(Preacher).where(Preacher.id == preacher_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="preacher not found")
    await db.delete(obj)
    await db.commit()
    return {"status": "ok"}


@app.delete("/api/churches/{church_id}")
async def delete_church(church_id: str, db: AsyncSession = Depends(get_session), admin: User = Depends(require_admin)):
    q = select(Church).where(Church.id == church_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="church not found")
    await db.delete(obj)
    await db.commit()
    return {"status": "ok"}


@app.post("/api/sessions/{session_id}/start", response_model=SessionModel)
async def start_session(session_id: str, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    q = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="session not found")
    obj.start_at = datetime.utcnow()
    if obj.start_at and obj.end_at:
        obj.duration_sec = int((obj.end_at - obj.start_at).total_seconds())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@app.post("/api/sessions/{session_id}/stop", response_model=SessionModel)
async def stop_session(session_id: str, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    q = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="session not found")
    obj.end_at = datetime.utcnow()
    if obj.start_at and obj.end_at:
        obj.duration_sec = int((obj.end_at - obj.start_at).total_seconds())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@app.patch("/api/sessions/{session_id}", response_model=SessionModel)
async def update_session(session_id: str, payload: SessionBase, db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    q = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.exec(q)
    obj = res.one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="session not found")

    def _naive_utc(dt: Optional[datetime]):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt
        return dt.astimezone(timezone.utc).replace(tzinfo=None)

    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        if k in ('start_at', 'end_at'):
            v = _naive_utc(v)
        setattr(obj, k, v)

    if obj.start_at and obj.end_at:
        obj.duration_sec = int((obj.end_at - obj.start_at).total_seconds())
    else:
        obj.duration_sec = None

    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


class AuthPayload(BaseModel):
    login: str
    password: str
    name: Optional[str] = None


@app.post('/api/auth/register')
async def register_user(payload: AuthPayload, db: AsyncSession = Depends(get_session)):
    login = payload.login
    password = payload.password
    name = payload.name
    existing = await get_user_by_login(login, db)
    if existing:
        raise HTTPException(status_code=400, detail='login exists')
    # determine admin by ADMIN_LOGIN or fallback to ADMIN_EMAIL for compatibility
    admin_login = os.getenv('ADMIN_LOGIN') or os.getenv('ADMIN_EMAIL')
    role = 'admin' if (admin_login and admin_login == login) else 'user'
    u = User(login=login, email=None, name=name, password_hash=get_password_hash(password), role=role)
    db.add(u)
    await db.commit()
    await db.refresh(u)
    return {'id': u.id, 'login': u.login, 'name': u.name, 'role': u.role}


@app.post('/api/auth/login')
async def login(payload: AuthPayload, db: AsyncSession = Depends(get_session)):
    login = payload.login
    password = payload.password
    user = await get_user_by_login(login, db)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_access_token({'user_id': user.id, 'role': user.role})
    return {'access_token': token, 'token_type': 'bearer', 'user': {'id': user.id, 'login': user.login, 'role': user.role}}


@app.get('/api/auth/me')
async def me(current_user: User = Depends(get_current_user)):
    return {'id': current_user.id, 'login': current_user.login, 'email': current_user.email, 'name': current_user.name, 'role': current_user.role}
