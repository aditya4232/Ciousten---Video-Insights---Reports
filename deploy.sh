#!/bin/bash
# Ciousten Docker Deployment Script
# ===================================

echo "🚀 Ciousten - Video Insights & Reports"
echo "======================================"
echo ""

# Check Docker
echo "📋 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    exit 1
fi
echo "✅ Docker: $(docker --version)"

# Check .env file
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found at backend/.env"
    echo "📝 Copying .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your OpenRouter API key!"
fi

# Build and start containers
echo ""
echo "🔨 Building Docker containers..."
docker compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Ciousten is running!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "📋 To view logs: docker compose logs -f"
    echo "🛑 To stop: docker compose down"
else
    echo "❌ Failed to start containers!"
fi
