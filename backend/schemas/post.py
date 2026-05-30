from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import List, Optional
from schemas.comment import CommentOut

class PostBase(BaseModel):
    category: str = Field(..., description="complaint, suggestion, or info")
    title: str = Field(..., min_length=2, max_length=100)
    content: str = Field(..., min_length=10, max_length=2000)
    author: str = Field(default="익명", max_length=50)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid_categories = {"complaint", "suggestion", "info"}
        if v not in valid_categories:
            raise ValueError("category must be one of 'complaint', 'suggestion', or 'info'")
        return v

class PostCreate(PostBase):
    pass

class PostOut(PostBase):
    id: int
    image_url: Optional[str] = None
    likes: int
    status: str
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PostDetailOut(PostOut):
    comments: List[CommentOut] = []

    model_config = ConfigDict(from_attributes=True)

class PaginatedPostsOut(BaseModel):
    posts: List[PostOut]
    total: int
    page: int
    total_pages: int
