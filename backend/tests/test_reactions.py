import pytest

def test_reaction_like_toggle(client):
    # 1. Create post
    post_res = client.post("/api/posts", data={
        "category": "complaint", "title": "민원글", "content": "이것은 공감 테스트를 위한 게시글의 상세 내용입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = post_res.json()["id"]

    # 2. Like from Device A (Headers case-insensitive mapping in test client)
    headers_a = {"X-Device-ID": "device-uuid-12345"}
    res_like1 = client.post(f"/api/posts/{post_id}/like", headers=headers_a)
    assert res_like1.status_code == 200
    assert res_like1.json()["likes"] == 1
    assert res_like1.json()["liked"] is True

    # 3. Unlike from Device A (Toggle off)
    res_like2 = client.post(f"/api/posts/{post_id}/like", headers=headers_a)
    assert res_like2.status_code == 200
    assert res_like2.json()["likes"] == 0
    assert res_like2.json()["liked"] is False

def test_reaction_multiple_devices(client):
    # 1. Create post
    post_res = client.post("/api/posts", data={
        "category": "complaint", "title": "민원글", "content": "이것은 공감 테스트를 위한 게시글의 상세 내용입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = post_res.json()["id"]

    # 2. Like from Device A
    res_a = client.post(f"/api/posts/{post_id}/like", headers={"X-Device-ID": "device-a"})
    assert res_a.json()["likes"] == 1

    # 3. Like from Device B
    res_b = client.post(f"/api/posts/{post_id}/like", headers={"X-Device-ID": "device-b"})
    assert res_b.json()["likes"] == 2
    assert res_b.json()["liked"] is True

def test_reaction_missing_device_header(client):
    post_res = client.post("/api/posts", data={
        "category": "complaint", "title": "민원글", "content": "이것은 공감 테스트를 위한 게시글의 상세 내용입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = post_res.json()["id"]

    # Request without header
    response = client.post(f"/api/posts/{post_id}/like")
    # FastAPI automatically responds with 422 Unprocessable Entity for missing required Headers,
    # or if we check manually, we raise HTTP 400. In our case, Header(..., alias="X-Device-ID") raises 422.
    assert response.status_code == 422
