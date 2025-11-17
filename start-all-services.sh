#!/bin/bash

# AI-Based Learning Platform - Start All Services
# This script starts all backend services and the frontend in development mode

set -e

echo "🚀 AI-Based Learning Platform - Starting All Services"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo -e "${BLUE}Starting ${service_name}...${NC}"

    if [ ! -d "$service_path" ]; then
        echo -e "${RED}❌ Service directory not found: $service_path${NC}"
        return 1
    fi

    cd "$service_path"

    # Check if package.json has dev script
    if ! grep -q '"dev"' package.json 2>/dev/null; then
        echo -e "${YELLOW}⚠️  No dev script found for $service_name${NC}"
        cd - > /dev/null
        return 1
    fi

    # Start the service in background
    nohup pnpm dev > "../../logs/${service_name}.log" 2>&1 &
    echo $! > "../../logs/${service_name}.pid"

    echo -e "${GREEN}✓ ${service_name} started on port ${port}${NC}"
    cd - > /dev/null
}

# Create logs directory
mkdir -p logs

echo -e "${BLUE}📦 Checking dependencies...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ pnpm is installed${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    pnpm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

echo ""
echo -e "${BLUE}🗄️  Database Information:${NC}"
echo "  PostgreSQL: localhost:5432 (postgres/postgres123/learning_platform)"
echo "  Redis: localhost:6379 (password: redis123)"
echo "  To start databases, run: docker-compose -f docker-compose.dev.yml up -d"
echo ""

# Service definitions: name, path, port
declare -a services=(
    "Auth Service:services/auth-service:3002"
    "Analytics Service:services/analytics-service:3003"
    "AI Service:services/ai-service:3004"
    "Assessment Service:services/assessment-service:3005"
    "Bootcamp Service:services/bootcamp-service:3006"
    "Course Service:services/course-service:3007"
    "Notification Service:services/notification-service:3008"
    "Payment Service:services/payment-service:3009"
    "Code Execution:services/code-execution-service:3010"
    "Terminal Service:services/terminal-service:3011"
    "Recommendation:services/recommendation-service:3012"
    "Code Runner:services/code-runner:3005"
    "API Gateway:services/api:3001"
)

echo -e "${BLUE}🚀 Starting Backend Services...${NC}"
echo ""

# Start all services
for service in "${services[@]}"; do
    IFS=':' read -r name path port <<< "$service"
    start_service "$name" "$path" "$port" || true
    sleep 1
done

echo ""
echo -e "${BLUE}🌐 Starting Frontend...${NC}"
cd apps/web
nohup pnpm dev > ../../logs/web-frontend.log 2>&1 &
echo $! > ../../logs/web-frontend.pid
echo -e "${GREEN}✓ Web Frontend started on port 3000${NC}"
cd - > /dev/null

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  Frontend:           http://localhost:3000"
echo "  API Gateway:        http://localhost:3001"
echo "  Auth Service:       http://localhost:3002"
echo "  Analytics:          http://localhost:3003"
echo "  AI Service:         http://localhost:3004"
echo "  Assessment:         http://localhost:3005"
echo "  Bootcamp:           http://localhost:3006"
echo "  Email UI (Mailpit): http://localhost:8025"
echo "  pgAdmin:            http://localhost:5050"
echo "  Redis Commander:    http://localhost:8081"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "  View logs: tail -f logs/<service-name>.log"
echo "  All logs: ls -la logs/"
echo ""
echo -e "${BLUE}🛑 To stop all services:${NC}"
echo "  Run: ./stop-all-services.sh"
echo ""
