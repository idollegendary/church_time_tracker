from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Church(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    timezone: Optional[str] = Field(default='UTC')
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Preacher(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    church_id: Optional[str] = None
    avatar_url: Optional[str] = None


class SessionBase(SQLModel):
    church_id: Optional[str] = None
    preacher_id: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    service_type: Optional[str] = None
    notes: Optional[str] = None


class Session(SessionBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    duration_sec: Optional[int] = None


class User(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    login: str
    email: Optional[str] = None
    name: Optional[str] = None
    password_hash: str
    role: str = 'user'  # 'user' or 'admin'
    created_at: datetime = Field(default_factory=datetime.utcnow)
