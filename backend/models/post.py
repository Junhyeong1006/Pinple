from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, nullable=False, index=True) # 'complaint', 'suggestion', 'info'
    title = Column(String(100), nullable=False)
    content = Column(String(2000), nullable=False)
    author = Column(String(50), nullable=False, default="익명")
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    image_url = Column(String, nullable=True)
    likes = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="active") # 'active', 'resolved', 'hidden'
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")
