import pytest

@pytest.mark.asyncio
async def test_notes_crud_dashboard_chat(client, auth_headers_user_a):
    # Get project
    proj_res = await client.get("/api/v1/projects", headers=auth_headers_user_a)
    project_id = proj_res.json()[0]["id"]

    # Create note
    note_res = await client.post("/api/v1/notes", headers=auth_headers_user_a, json={
        "project_id": project_id,
        "title": "Empirical Scaling Notes",
        "content_markdown": "# Scaling Laws\nSub-linear returns beyond 100M tokens.",
        "tags": ["scaling", "empirical"]
    })
    assert note_res.status_code == 201
    note_id = note_res.json()["id"]

    # List notes
    notes_list = await client.get(f"/api/v1/notes?project_id={project_id}", headers=auth_headers_user_a)
    assert notes_list.status_code == 200
    assert any(n["id"] == note_id for n in notes_list.json())

    # Update note
    upd = await client.put(f"/api/v1/notes/{note_id}", headers=auth_headers_user_a, json={
        "title": "Updated Scaling Notes"
    })
    assert upd.status_code == 200
    assert upd.json()["title"] == "Updated Scaling Notes"

    # Create collection
    col_res = await client.post(
        f"/api/v1/collections?project_id={project_id}",
        headers=auth_headers_user_a,
        json={"name": "Transformer Baselines", "color_hex": "#6366F1"}
    )
    assert col_res.status_code == 201

    # Chat: create conversation and query
    conv_res = await client.post("/api/v1/chat/conversations", headers=auth_headers_user_a, json={
        "project_id": project_id, "title": "Attention Analysis"
    })
    assert conv_res.status_code == 201
    conv_id = conv_res.json()["id"]

    query_res = await client.post("/api/v1/chat/query", headers=auth_headers_user_a, json={
        "conversation_id": conv_id,
        "message": "What is the computational complexity of self-attention?"
    })
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert "content" in q_data
    assert len(q_data["citations"]) > 0
    assert q_data["citations"][0]["confidence_score"] >= 0.9

    # Dashboard stats
    dash = await client.get(f"/api/v1/dashboard/stats?project_id={project_id}", headers=auth_headers_user_a)
    assert dash.status_code == 200
    stats = dash.json()
    assert stats["total_notes"] >= 1
    assert stats["total_collections"] >= 1
    assert stats["active_project_id"] == project_id

    # Delete note
    del_res = await client.delete(f"/api/v1/notes/{note_id}", headers=auth_headers_user_a)
    assert del_res.status_code == 204
