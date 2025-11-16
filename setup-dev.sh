#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment for the AI Learning Platform

set -e  # Exit on error

echo "========================================"
echo "AI Learning Platform - Development Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "${YELLOW}⚠ Please update .env with your actual values${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        echo "Please create a .env file manually"
    fi
    echo ""
fi

# Generate Prisma Client
echo "Step 1: Generating Prisma Client..."
echo "-----------------------------------"
if [ -d "packages/database" ]; then
    cd packages/database

    # Check if schema.prisma exists
    if [ -f "prisma/schema.prisma" ]; then
        echo "Generating Prisma client..."
        pnpm prisma generate
        echo -e "${GREEN}✓ Prisma client generated${NC}"
    else
        echo -e "${RED}✗ prisma/schema.prisma not found${NC}"
    fi

    cd ../..
else
    echo -e "${YELLOW}⚠ packages/database directory not found${NC}"
fi
echo ""

# Check if PostgreSQL is running
echo "Step 2: Checking PostgreSQL..."
echo "-------------------------------"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL CLI found${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL CLI not found${NC}"
    echo "Make sure PostgreSQL is installed and running"
fi
echo ""

# Check if Redis is running
echo "Step 3: Checking Redis..."
echo "-------------------------"
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠ Redis is not responding${NC}"
        echo "Make sure Redis is installed and running"
    fi
else
    echo -e "${YELLOW}⚠ Redis CLI not found${NC}"
    echo "Make sure Redis is installed and running"
fi
echo ""

# Check if Docker is running
echo "Step 4: Checking Docker..."
echo "--------------------------"
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker is running${NC}"
    else
        echo -e "${YELLOW}⚠ Docker daemon is not running${NC}"
        echo "Start Docker Desktop to enable terminal and code execution services"
    fi
else
    echo -e "${YELLOW}⚠ Docker not found${NC}"
    echo "Install Docker Desktop for full functionality"
fi
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual configuration"
echo "2. Run database migrations:"
echo "   pnpm --filter @ai-learning/database prisma migrate dev"
echo "3. Seed the database (optional):"
echo "   pnpm --filter @ai-learning/database prisma db seed"
echo "4. Start the development server:"
echo "   pnpm dev"
echo ""
