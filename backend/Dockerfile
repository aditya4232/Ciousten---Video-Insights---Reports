FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and other libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Create necessary directories
RUN mkdir -p data reports sam_models

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Default port (can be overridden by cloud providers)
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application with dynamic port binding
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}

