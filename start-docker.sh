#!/bin/bash

echo "🚀 Starting File Manager Application with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the application
echo "🔨 Building and starting containers..."
docker-compose up --build -d

echo ""
echo "✅ Application is starting up!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop app: docker-compose down"
echo "🧹 Clean up: docker-compose down -v --rmi all"
