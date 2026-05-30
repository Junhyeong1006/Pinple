from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

connect_args = {}
poolclass = None

import os

if is_sqlite:
    # 1. check_same_thread=False allows FastAPI multi-threading
    # 2. timeout=30.0 gives SQLite up to 30s to wait for a write lock release before throwing error
    connect_args = {"check_same_thread": False, "timeout": 30.0}
    # StaticPool prevents multiple database instances from locking each other
    poolclass = StaticPool
    
    # Auto-create directory path if it contains subdirectories
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass if is_sqlite else None
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enable WAL mode and enforce Foreign Key Constraints upon SQLite connection
if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

# Dependency to get db session in API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
