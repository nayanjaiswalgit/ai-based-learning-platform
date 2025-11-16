#!/bin/bash

# AI-Based Learning Platform - Docker Stop Script

set -e

echo "🛑 Stopping AI-Based Learning Platform..."
echo ""

# Check which compose file is running
if docker ps | grep -q "learning-platform-db-dev"; then
    echo "Stopping development infrastructure..."
    docker-compose -f docker-compose.dev.yml down
elif docker ps | grep -q "learning-platform-db"; then
    echo "Stopping production services..."
    docker-compose down
else
    echo "No services are currently running."
    exit 0
fi

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To remove volumes (data will be lost):"
echo "   ./scripts/docker-clean.sh"
