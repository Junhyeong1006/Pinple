from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String, nullable=False) # Unique UUID for devices
    type = Column(String, nullable=False, default="like") # defaults to 'like'
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    post = relationship("Post", back_populates="reactions")

    __table_args__ = (
        UniqueConstraint("post_id", "device_id", "type", name="uq_post_device_reaction"),
    )
