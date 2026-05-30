import pytest

def test_create_post(client):
    # Form data for creation
    form_data = {
        "category": "complaint",
        "title": "가로등 고장",
        "content": "공원 중간 가로등이 깨져서 밤길이 너무 어둡습니다.",
        "author": "홍길동",
        "latitude": 37.5665,
        "longitude": 126.9780
    }
    
    response = client.post("/api/posts", data=form_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "가로등 고장"
    assert data["category"] == "complaint"
    assert data["latitude"] == 37.5665
    assert data["image_url"] is None
    assert data["likes"] == 0

def test_create_post_invalid_category(client):
    form_data = {
        "category": "invalid_cat",
        "title": "가로등 고장",
        "content": "공원 중간 가로등이 깨져서 밤길이 너무 어둡습니다.",
        "author": "홍길동",
        "latitude": 37.5665,
        "longitude": 126.9780
    }
    response = client.post("/api/posts", data=form_data)
    assert response.status_code == 400

def test_get_posts(client):
    # Create two posts
    client.post("/api/posts", data={
        "category": "complaint", "title": "민원글", "content": "공원 주변 보도블록이 파손되었습니다.", "latitude": 37.5, "longitude": 126.9
    })
    client.post("/api/posts", data={
        "category": "info", "title": "정보글", "content": "벼룩시장 정보 공유 드립니다.", "latitude": 37.6, "longitude": 127.0
    })

    # Retrieve all
    response = client.get("/api/posts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["posts"]) == 2

    # Filter by category
    response = client.get("/api/posts?category=complaint")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["posts"][0]["category"] == "complaint"

def test_get_posts_geospatial_filter(client):
    # Centered at Seoul City Hall (37.5665, 126.9780)
    # Post 1: Very close (City Hall) -> ~0 km
    client.post("/api/posts", data={
        "category": "complaint", "title": "시청 앞 포트홀", "content": "시청 바로 앞 도로 파손1", "latitude": 37.5665, "longitude": 126.9780
    })
    
    # Post 2: Far away (Incheon area) -> ~30km
    client.post("/api/posts", data={
        "category": "info", "title": "인천 정보", "content": "인천 관련 상세 소식입니다.", "latitude": 37.4563, "longitude": 126.7052
    })

    # Query with lat/lng and 5km radius
    response = client.get("/api/posts?lat=37.5665&lng=126.9780&radius=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["posts"][0]["title"] == "시청 앞 포트홀"

def test_get_post_detail(client):
    # Create post
    create_res = client.post("/api/posts", data={
        "category": "complaint", "title": "테스트", "content": "이것은 상세 조회를 위한 테스트 내용입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = create_res.json()["id"]

    # Get detail
    response = client.get(f"/api/posts/{post_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "테스트"
    assert "comments" in data
    assert len(data["comments"]) == 0

def test_delete_post(client):
    create_res = client.post("/api/posts", data={
        "category": "complaint", "title": "삭제할 글", "content": "이 글은 테스트를 위해 삭제될 예정입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/posts/{post_id}")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "게시물이 성공적으로 삭제되었습니다."

    # Check detail is 404
    get_res = client.get(f"/api/posts/{post_id}")
    assert get_res.status_code == 404
