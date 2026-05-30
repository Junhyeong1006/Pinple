import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from config import settings
from routers import posts, comments, reactions

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pinple")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (no migrations for initial SQLite)
    logger.info("Initializing database and creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("📌 Pinple 백엔드가 성공적으로 가동되었습니다.")
    yield
    logger.info("👋 Pinple 백엔드가 종료되었습니다.")

app = FastAPI(
    title="Pinple API",
    description="시민 참여형 지도 커뮤니티 API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware dynamically
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount it
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routes under prefix '/api'
app.include_router(posts.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(reactions.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": "Pinple"}
