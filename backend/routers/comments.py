from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.comment import CommentCreate, CommentOut
from models.comment import Comment
from models.post import Post

router = APIRouter(prefix="/posts", tags=["comments"])

@router.post("/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment_for_post(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db)
):
    # Verify post exists
    post = db.query(Post).filter(Post.id == post_id, Post.status == "active").first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="댓글을 작성할 게시물을 찾을 수 없습니다."
        )

    db_comment = Comment(
        post_id=post_id,
        author=comment_data.author,
        content=comment_data.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment
