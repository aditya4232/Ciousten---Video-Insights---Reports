# Ciousten Docker Deployment Script
# ===================================

Write-Host "🚀 Ciousten - Video Insights & Reports" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "📋 Checking Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green

# Check .env file
$envFile = "backend/.env"
if (!(Test-Path $envFile)) {
    Write-Host "❌ .env file not found at $envFile" -ForegroundColor Red
    Write-Host "📝 Copying .env.example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" $envFile
    Write-Host "⚠️  Please edit $envFile and add your OpenRouter API key!" -ForegroundColor Yellow
}

# Build and start containers
Write-Host ""
Write-Host "🔨 Building Docker containers..." -ForegroundColor Yellow
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Ciousten is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 To view logs: docker compose logs -f" -ForegroundColor Gray
    Write-Host "🛑 To stop: docker compose down" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start containers!" -ForegroundColor Red
}
