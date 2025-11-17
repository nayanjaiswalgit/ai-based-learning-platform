#!/bin/bash

# AI-Based Learning Platform - Stop All Services
# This script stops all running services

set -e

echo "🛑 Stopping All Services..."
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Stop services from PID files
if [ -d "logs" ]; then
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            service_name=$(basename "$pidfile" .pid)
            pid=$(cat "$pidfile")

            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${BLUE}Stopping ${service_name} (PID: $pid)...${NC}"
                kill "$pid" 2>/dev/null || true
                echo -e "${GREEN}✓ ${service_name} stopped${NC}"
            else
                echo -e "${RED}⚠️  ${service_name} is not running${NC}"
            fi

            rm "$pidfile"
        fi
    done
else
    echo -e "${RED}No logs directory found. Services may not be running.${NC}"
fi

# Kill any remaining node processes on our ports
echo ""
echo -e "${BLUE}Checking for remaining processes on service ports...${NC}"

ports=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012)

for port in "${ports[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo -e "${BLUE}Killing process on port $port (PID: $pid)${NC}"
        kill -9 "$pid" 2>/dev/null || true
    fi
done

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All services stopped!${NC}"
echo ""
