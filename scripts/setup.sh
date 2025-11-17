#!/bin/bash

# AI Learning Platform Setup Script
echo "🚀 Setting up AI Learning Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.15.1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start infrastructure services
echo "🐳 Starting infrastructure services (Postgres, Redis, Meilisearch)..."
docker compose up -d postgres redis meilisearch

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
cd packages/database && pnpm db:generate && cd ../..

# Run database migrations
echo "🗄️  Running database migrations..."
cd packages/database && pnpm db:migrate && cd ../..

# Seed database
echo "🌱 Seeding database with initial data..."
docker compose --profile seed up db-seed

# Wait for seed to complete
echo "⏳ Waiting for seed to complete..."
sleep 5

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Review and update the .env file with your configuration"
echo "  2. Start the development servers: pnpm dev"
echo "  3. Or start all services with Docker: docker compose up"
echo ""
echo "🌐 Services will be available at:"
echo "  - Web App: http://localhost:3000"
echo "  - API Gateway: http://localhost:3001"
echo "  - Database: postgresql://localhost:5432/learning_platform"
echo "  - Redis: redis://localhost:6379"
echo "  - Meilisearch: http://localhost:7700"
echo ""
