import io
import pytest

_PDF = b"%PDF-1.4\nSecurity Isolation Test\n%%EOF"

@pytest.mark.asyncio
async def test_cross_user_project_isolation(client, auth_headers_user_a, auth_headers_user_b):
    # User A creates project
    res_a = await client.post("/api/v1/projects", headers=auth_headers_user_a, json={
        "title": "User A Secret Research"
    })
    project_a_id = res_a.json()["id"]

    # User B cannot access, update, or delete User A's project
    assert (await client.get(f"/api/v1/projects/{project_a_id}", headers=auth_headers_user_b)).status_code == 404
    assert (await client.put(f"/api/v1/projects/{project_a_id}", headers=auth_headers_user_b, json={"title": "Hacked"})).status_code == 404
    assert (await client.delete(f"/api/v1/projects/{project_a_id}", headers=auth_headers_user_b)).status_code == 404

@pytest.mark.asyncio
async def test_cross_user_paper_isolation(client, auth_headers_user_a, auth_headers_user_b):
    # User A project & paper
    proj_res = await client.get("/api/v1/projects", headers=auth_headers_user_a)
    proj_a_id = proj_res.json()[0]["id"]

    upload = await client.post("/api/v1/papers/upload", headers=auth_headers_user_a,
        data={"project_id": proj_a_id},
        files={"file": ("secret.pdf", io.BytesIO(_PDF), "application/pdf")})
    paper_id = upload.json()["paper_id"]

    # User B cannot access any aspect of User A's paper
    assert (await client.get(f"/api/v1/papers/{paper_id}", headers=auth_headers_user_b)).status_code == 404
    assert (await client.get(f"/api/v1/papers/{paper_id}/pdf", headers=auth_headers_user_b)).status_code == 404
    assert (await client.get(f"/api/v1/papers?project_id={proj_a_id}", headers=auth_headers_user_b)).status_code == 404
    assert (await client.delete(f"/api/v1/papers/{paper_id}", headers=auth_headers_user_b)).status_code == 404
