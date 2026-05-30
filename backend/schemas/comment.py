from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class CommentBase(BaseModel):
    author: str = Field(default="익명", max_length=50)
    content: str = Field(..., min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    id: int
    post_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
