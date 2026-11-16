"""
ResearchLens Backend Test Suite — conftest.py
----------------------------------------------
Uses pytest-asyncio with async httpx.AsyncClient + ASGITransport.
All test functions are async. No network, no threads, no event-loop conflicts.
"""

import os

# Set env BEFORE any app imports
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-researchlens-2026")

import pytest
import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app as fastapi_app

# Single shared in-memory SQLite engine
_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    import app.models.models  # Register all ORM models
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture(autouse=True)
def _reset_tables():
    """Clear all rows between test functions for isolation."""
    yield
    with _engine.connect() as conn:
        for tbl in reversed(Base.metadata.sorted_tables):
            conn.execute(tbl.delete())
        conn.commit()


@pytest.fixture
async def client():
    """Async httpx client backed by in-memory DB via ASGI transport."""
    def _override():
        db = _SessionLocal()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = _override
    transport = httpx.ASGITransport(app=fastapi_app, raise_app_exceptions=True)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
        timeout=15.0,
    ) as ac:
        yield ac
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
async def auth_headers_user_a(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "researcher.a@stanford.edu",
        "password": "Password123!Secure",
        "full_name": "Dr. Researcher A",
        "institution": "Stanford University",
    })
    assert res.status_code == 201, f"User A reg failed: {res.text}"
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
async def auth_headers_user_b(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "researcher.b@mit.edu",
        "password": "Password456!Secure",
        "full_name": "Prof. Researcher B",
        "institution": "MIT CSAIL",
    })
    assert res.status_code == 201, f"User B reg failed: {res.text}"
    return {"Authorization": f"Bearer {res.json()['access_token']}"}
