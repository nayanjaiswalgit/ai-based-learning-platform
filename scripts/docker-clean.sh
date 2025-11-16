#!/bin/bash

# AI-Based Learning Platform - Docker Clean Script
# WARNING: This will remove all data!

set -e

echo "⚠️  WARNING: This will remove all Docker volumes and data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🧹 Cleaning up Docker resources..."

# Stop all services
if docker ps | grep -q "learning-platform"; then
    echo "Stopping services..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
fi

# Remove volumes
echo "Removing volumes..."
docker volume rm learning-platform-postgres_data 2>/dev/null || true
docker volume rm learning-platform-postgres_dev_data 2>/dev/null || true
docker volume rm learning-platform-redis_data 2>/dev/null || true
docker volume rm learning-platform-redis_dev_data 2>/dev/null || true
docker volume rm learning-platform-meilisearch_data 2>/dev/null || true
docker volume rm learning-platform-meilisearch_dev_data 2>/dev/null || true
docker volume rm learning-platform-pgadmin_data 2>/dev/null || true
docker volume rm learning-platform-pgadmin_dev_data 2>/dev/null || true

# Prune unused images
echo "Removing unused images..."
docker image prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 To start fresh, run:"
echo "   ./scripts/docker-start.sh"
