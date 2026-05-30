FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if any needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code files
COPY config.py .
COPY database.py .
COPY main.py .
COPY models/ ./models/
COPY routers/ ./routers/
COPY schemas/ ./schemas/
COPY services/ ./services/

# Create directory for file uploads
RUN mkdir -p /app/uploads

# Expose FastAPI port
EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
