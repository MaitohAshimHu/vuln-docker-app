@echo off
echo 🚀 Starting File Manager Application with Docker...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo 🔨 Building and starting containers...
docker-compose up --build -d

echo.
echo ✅ Application is starting up!
echo 🌐 Frontend: http://localhost
echo 🔧 Backend API: http://localhost:5000
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop app: docker-compose down
echo 🧹 Clean up: docker-compose down -v --rmi all
echo.
pause
