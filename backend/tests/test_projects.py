import pytest

@pytest.mark.asyncio
async def test_list_projects(client, auth_headers_user_a):
    res = await client.get("/api/v1/projects", headers=auth_headers_user_a)
    assert res.status_code == 200
    assert len(res.json()) >= 1  # Default project created at registration

@pytest.mark.asyncio
async def test_create_and_get_project(client, auth_headers_user_a):
    create_res = await client.post("/api/v1/projects", headers=auth_headers_user_a, json={
        "title": "Vision-Language Model Compression",
        "description": "Quantization of visual backbones",
        "research_field": "Computer Vision"
    })
    assert create_res.status_code == 201
    project_id = create_res.json()["id"]
    
    get_res = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers_user_a)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

@pytest.mark.asyncio
async def test_update_project(client, auth_headers_user_a):
    create_res = await client.post("/api/v1/projects", headers=auth_headers_user_a, json={
        "title": "Initial Title"
    })
    project_id = create_res.json()["id"]
    
    update_res = await client.put(f"/api/v1/projects/{project_id}", headers=auth_headers_user_a, json={
        "title": "Updated Modern Title"
    })
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Modern Title"

@pytest.mark.asyncio
async def test_delete_project(client, auth_headers_user_a):
    create_res = await client.post("/api/v1/projects", headers=auth_headers_user_a, json={
        "title": "Project to Delete"
    })
    project_id = create_res.json()["id"]
    
    del_res = await client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers_user_a)
    assert del_res.status_code == 204
    
    get_res = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers_user_a)
    assert get_res.status_code == 404
