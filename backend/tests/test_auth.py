import pytest

@pytest.mark.asyncio
async def test_register_success(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "dr.smith@oxford.ac.uk",
        "password": "SecurePassword2026!",
        "full_name": "Dr. Sarah Smith",
        "institution": "University of Oxford"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "dr.smith@oxford.ac.uk"

@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "Password123!", "full_name": "Duplicate User"}
    r1 = await client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = await client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409
    assert "already exists" in r2.json()["detail"]

@pytest.mark.asyncio
async def test_register_short_password_validation(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "short@example.com", "password": "123", "full_name": "Short Password"
    })
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login.test@example.com", "password": "ValidPassword99!", "full_name": "Login Test User"
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "login.test@example.com", "password": "ValidPassword99!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

@pytest.mark.asyncio
async def test_login_invalid_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrong.pass@example.com", "password": "CorrectPassword1!", "full_name": "Wrong Pass"
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "wrong.pass@example.com", "password": "WrongPassword!"
    })
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_get_me_authenticated(client, auth_headers_user_a):
    res = await client.get("/api/v1/auth/me", headers=auth_headers_user_a)
    assert res.status_code == 200
    assert res.json()["email"] == "researcher.a@stanford.edu"

@pytest.mark.asyncio
async def test_get_me_unauthorized(client):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401
