import io
import pytest

_VALID_PDF = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"

async def _get_project_id(client, headers):
    res = await client.get("/api/v1/projects", headers=headers)
    return res.json()[0]["id"]

@pytest.mark.asyncio
async def test_paper_upload_and_listing(client, auth_headers_user_a):
    project_id = await _get_project_id(client, auth_headers_user_a)
    
    upload_res = await client.post(
        "/api/v1/papers/upload",
        headers=auth_headers_user_a,
        data={"project_id": project_id},
        files={"file": ("attention.pdf", io.BytesIO(_VALID_PDF), "application/pdf")}
    )
    assert upload_res.status_code == 202, upload_res.text
    data = upload_res.json()
    assert data["status"] == "indexed"
    paper_id = data["paper_id"]

    list_res = await client.get(f"/api/v1/papers?project_id={project_id}", headers=auth_headers_user_a)
    assert list_res.status_code == 200
    assert any(p["id"] == paper_id for p in list_res.json())

    status_res = await client.get(f"/api/v1/papers/{paper_id}/status", headers=auth_headers_user_a)
    assert status_res.status_code == 200
    assert status_res.json()["progress_pct"] == 100

    pdf_res = await client.get(f"/api/v1/papers/{paper_id}/pdf", headers=auth_headers_user_a)
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b"%PDF-")

    del_res = await client.delete(f"/api/v1/papers/{paper_id}", headers=auth_headers_user_a)
    assert del_res.status_code == 204

@pytest.mark.asyncio
async def test_duplicate_paper_upload(client, auth_headers_user_a):
    project_id = await _get_project_id(client, auth_headers_user_a)
    pdf = b"%PDF-1.4\nDuplicate test content\n%%EOF"
    
    r1 = await client.post("/api/v1/papers/upload", headers=auth_headers_user_a,
        data={"project_id": project_id},
        files={"file": ("paper_a.pdf", io.BytesIO(pdf), "application/pdf")})
    assert r1.status_code == 202
    
    r2 = await client.post("/api/v1/papers/upload", headers=auth_headers_user_a,
        data={"project_id": project_id},
        files={"file": ("paper_a_dup.pdf", io.BytesIO(pdf), "application/pdf")})
    assert r2.status_code == 409
    assert "already been uploaded" in r2.json()["detail"]

@pytest.mark.asyncio
async def test_invalid_pdf_rejected(client, auth_headers_user_a):
    project_id = await _get_project_id(client, auth_headers_user_a)
    non_pdf = b"This is plain text, not a PDF"
    
    res = await client.post("/api/v1/papers/upload", headers=auth_headers_user_a,
        data={"project_id": project_id},
        files={"file": ("invalid.txt", io.BytesIO(non_pdf), "application/pdf")})
    assert res.status_code == 400
    assert "not a valid scientific PDF" in res.json()["detail"]
