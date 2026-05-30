from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from database import get_db
from models.post import Post
from models.reaction import Reaction

router = APIRouter(prefix="/posts", tags=["reactions"])

@router.post("/{post_id}/like", status_code=status.HTTP_200_OK)
async def toggle_like_post(
    post_id: int,
    x_device_id: str = Header(..., alias="X-Device-ID", description="Unique device identifier"),
    db: Session = Depends(get_db)
):
    if not x_device_id or x_device_id.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="X-Device-ID 헤더가 비어 있거나 누락되었습니다."
        )

    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id, Post.status == "active").first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="공감할 게시물을 찾을 수 없습니다."
        )

    # Check for existing reaction by this device
    existing_reaction = db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.device_id == x_device_id,
        Reaction.type == "like"
    ).first()

    if existing_reaction:
        # Toggle off (Unlike)
        db.delete(existing_reaction)
        post.likes = max(0, post.likes - 1)
        db.commit()
        db.refresh(post)
        return {"likes": post.likes, "liked": False}
    else:
        # Toggle on (Like)
        new_reaction = Reaction(
            post_id=post_id,
            device_id=x_device_id,
            type="like"
        )
        db.add(new_reaction)
        post.likes += 1
        db.commit()
        db.refresh(post)
        return {"likes": post.likes, "liked": True}
