import os
from dotenv import load_dotenv

# Load .env file from the root directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(base_dir, ".env")

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///pinple.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")

settings = Settings()
