#!/bin/bash

# AI-Based Learning Platform - Docker Startup Script
# This script helps you start the platform with Docker

set -e

echo "🚀 AI-Based Learning Platform - Docker Startup"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update it if needed."
fi

# Ask user which mode to run
echo "Select mode:"
echo "1) Development (Infrastructure only + pnpm dev for apps)"
echo "2) Production (All services in Docker)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "📦 Starting infrastructure services in development mode..."
        docker-compose -f docker-compose.dev.yml up -d
        echo ""
        echo "✅ Infrastructure services started!"
        echo ""
        echo "📋 Services:"
        echo "   - PostgreSQL:     http://localhost:5432"
        echo "   - Redis:          http://localhost:6379"
        echo "   - Meilisearch:    http://localhost:7700"
        echo "   - Mailpit UI:     http://localhost:8025"
        echo "   - pgAdmin:        http://localhost:5050"
        echo "   - Redis Commander: http://localhost:8081"
        echo ""
        echo "🔄 Now run: pnpm dev"
        echo "   to start application services with hot reload"
        ;;
    2)
        echo ""
        echo "📦 Building and starting all services in production mode..."
        echo "⚠️  This will take several minutes on first run..."
        docker-compose up -d --build
        echo ""
        echo "✅ All services started!"
        echo ""
        echo "📋 Services:"
        echo "   - Web App:        http://localhost:3000"
        echo "   - Admin App:      http://localhost:3001"
        echo "   - API Gateway:    http://localhost:4000"
        echo "   - API Docs:       http://localhost:4000/api/docs"
        echo "   - PostgreSQL:     http://localhost:5432"
        echo "   - Redis:          http://localhost:6379"
        echo "   - Meilisearch:    http://localhost:7700"
        echo "   - Mailpit UI:     http://localhost:8025"
        echo ""
        echo "🔍 View logs: docker-compose logs -f"
        echo "🛑 Stop all:  docker-compose down"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "✨ Setup complete!"
