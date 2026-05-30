from sqlalchemy.orm import Session
from models.post import Post
from models.comment import Comment
from services.geo_service import get_bounding_box, haversine_distance
from schemas.post import PostCreate
from typing import Optional, List, Tuple
from datetime import datetime, timedelta

def create_post(db: Session, post_data: PostCreate, image_url: Optional[str] = None) -> Post:
    db_post = Post(
        category=post_data.category,
        title=post_data.title,
        content=post_data.content,
        author=post_data.author,
        latitude=post_data.latitude,
        longitude=post_data.longitude,
        image_url=image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_post_by_id(db: Session, post_id: int) -> Optional[Post]:
    return db.query(Post).filter(Post.id == post_id, Post.status == "active").first()

def get_posts(
    db: Session,
    category: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: float = 5.0,
    search: Optional[str] = None,
    hours_ago: Optional[int] = None,
    page: int = 1,
    limit: int = 50
) -> Tuple[List[Post], int]:
    query = db.query(Post).filter(Post.status == "active")

    if category:
        query = query.filter(Post.category == category)
        
    if search:
        query = query.filter(
            (Post.title.ilike(f"%{search}%")) | (Post.content.ilike(f"%{search}%"))
        )

    if hours_ago:
        time_threshold = datetime.utcnow() - timedelta(hours=hours_ago)
        query = query.filter(Post.created_at >= time_threshold)

    # Geospatial 2-stage filtering
    if lat is not None and lng is not None:
        # Stage 1: Bound box DB query (takes advantage of index)
        min_lat, max_lat, min_lng, max_lng = get_bounding_box(lat, lng, radius)
        query = query.filter(
            Post.latitude.between(min_lat, max_lat),
            Post.longitude.between(min_lng, max_lng)
        )
        
        # Fetch candidate records
        all_candidates = query.order_by(Post.created_at.desc()).all()
        
        # Stage 2: Refined haversine filtering in Python
        nearby_posts = []
        for post in all_candidates:
            dist = haversine_distance(lat, lng, post.latitude, post.longitude)
            if dist <= radius:
                nearby_posts.append(post)
                
        total = len(nearby_posts)
        start = (page - 1) * limit
        end = start + limit
        paginated_posts = nearby_posts[start:end]
        return paginated_posts, total
    else:
        # Standard DB pagination when no map bounds are applied
        total = query.count()
        posts = query.order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return posts, total

def delete_post(db: Session, post_id: int) -> bool:
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post:
        db.delete(db_post)
        db.commit()
        return True
    return False
