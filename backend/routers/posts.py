import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.post import PostOut, PostDetailOut, PaginatedPostsOut, PostCreate
from services import post_service
from typing import Optional

router = APIRouter(prefix="/posts", tags=["posts"])
UPLOAD_DIR = "uploads"

# Ensure uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024 # 5MB

@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_new_post(
    category: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    author: str = Form("익명"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Form data validation via Pydantic
    try:
        post_data = PostCreate(
            category=category,
            title=title,
            content=content,
            author=author,
            latitude=latitude,
            longitude=longitude
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    image_url = None
    if image and image.filename:
        # Validate file size
        image.file.seek(0, 2)
        size = image.file.tell()
        image.file.seek(0)
        
        if size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="이미지 크기는 최대 5MB까지만 허용됩니다."
            )

        # Validate file extension
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="허용되지 않는 파일 확장자입니다. (jpg, jpeg, png, webp만 허용)"
            )
        
        # Save file with UUID to prevent overlaps
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Store relative path in DB to avoid hardcoding domain
        image_url = f"/uploads/{filename}"

    db_post = post_service.create_post(db, post_data, image_url)
    
    return PostOut(
        id=db_post.id,
        category=db_post.category,
        title=db_post.title,
        content=db_post.content,
        author=db_post.author,
        latitude=db_post.latitude,
        longitude=db_post.longitude,
        image_url=db_post.image_url,
        likes=db_post.likes,
        status=db_post.status,
        comment_count=0,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at
    )

@router.get("", response_model=PaginatedPostsOut)
async def get_all_posts(
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: float = Query(5.0),
    search: Optional[str] = Query(None),
    hours_ago: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    posts, total = post_service.get_posts(
        db, category, lat, lng, radius, search, hours_ago, page, limit
    )
    
    # Map database records to schemas including comment counts
    output_posts = []
    for post in posts:
        comment_count = len(post.comments)
        output_posts.append(
            PostOut(
                id=post.id,
                category=post.category,
                title=post.title,
                content=post.content,
                author=post.author,
                latitude=post.latitude,
                longitude=post.longitude,
                image_url=post.image_url,
                likes=post.likes,
                status=post.status,
                comment_count=comment_count,
                created_at=post.created_at,
                updated_at=post.updated_at
            )
        )
    
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    return PaginatedPostsOut(
        posts=output_posts,
        total=total,
        page=page,
        total_pages=total_pages
    )

@router.get("/{post_id}", response_model=PostDetailOut)
async def get_post_detail(post_id: int, db: Session = Depends(get_db)):
    post = post_service.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 게시물을 찾을 수 없습니다."
        )
    
    # Sort comments by created_at ascending
    sorted_comments = sorted(post.comments, key=lambda c: c.created_at)
    
    return PostDetailOut(
        id=post.id,
        category=post.category,
        title=post.title,
        content=post.content,
        author=post.author,
        latitude=post.latitude,
        longitude=post.longitude,
        image_url=post.image_url,
        likes=post.likes,
        status=post.status,
        comment_count=len(post.comments),
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=sorted_comments
    )

@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def delete_existing_post(post_id: int, db: Session = Depends(get_db)):
    success = post_service.delete_post(db, post_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 게시물을 찾을 수 없거나 삭제할 수 없습니다."
        )
    return {"message": "게시물이 성공적으로 삭제되었습니다."}
