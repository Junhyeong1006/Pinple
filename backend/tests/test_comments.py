import pytest

def test_create_comment(client):
    # 1. Create post
    post_res = client.post("/api/posts", data={
        "category": "complaint", "title": "민원글", "content": "이것은 댓글 작성을 검증하기 위한 상세 내용입니다.", "latitude": 37.5, "longitude": 126.9
    })
    post_id = post_res.json()["id"]

    # 2. Create comment
    comment_data = {
        "author": "홍길동",
        "content": "공감합니다! 빠른 시일 내에 고쳐졌으면 좋겠네요."
    }
    comment_res = client.post(f"/api/posts/{post_id}/comments", json=comment_data)
    assert comment_res.status_code == 201
    
    data = comment_res.json()
    assert data["author"] == "홍길동"
    assert data["content"] == "공감합니다! 빠른 시일 내에 고쳐졌으면 좋겠네요."
    assert data["post_id"] == post_id

    # 3. Check post detail shows comment
    detail_res = client.get(f"/api/posts/{post_id}")
    detail_data = detail_res.json()
    assert len(detail_data["comments"]) == 1
    assert detail_data["comments"][0]["author"] == "홍길동"

def test_create_comment_nonexistent_post(client):
    comment_data = {
        "author": "익명",
        "content": "게시글이 없는데 댓글이 달리나요?"
    }
    response = client.post("/api/posts/9999/comments", json=comment_data)
    assert response.status_code == 404
