#!/bin/bash

# NeatSpend Services Auto-Start Script
# This script runs every time the Codespace starts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting NeatSpend services...${NC}"

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⏳ Waiting for Docker daemon to start...${NC}"
    sleep 5
fi

# Start the services in the background
echo -e "${BLUE}🐳 Starting Docker Compose services...${NC}"
docker-compose up -d

# Wait a moment for services to initialize
sleep 3

# Check service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

# Health check function
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    echo -e "${YELLOW}⏳ Checking $service_name...${NC}"
    
    # Wait up to 30 seconds for service to be ready
    for i in {1..15}; do
        if curl -f -s "http://localhost:$port$endpoint" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy!${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${YELLOW}⚠️  $service_name may still be starting...${NC}"
    return 1
}

# Give services time to start
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check each service
check_service "PostgreSQL" "5432" "" || true
check_service "User Service" "3001" "/health" || true
check_service "API Gateway" "8080" "/health" || true

echo -e "${GREEN}🎉 NeatSpend services are starting up!${NC}"
echo -e "${BLUE}🌐 Available endpoints:${NC}"
echo "  • API Gateway Health: http://localhost:8080/health"
echo "  • User Service Health: http://localhost:3001/health"
echo "  • View all logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"

# Show real-time logs in the background (optional)
echo -e "${BLUE}📋 Starting log viewer in background...${NC}"
# Uncomment the next line if you want auto-tailing logs
# nohup docker-compose logs -f > /tmp/neatspend-logs.log 2>&1 &

echo -e "${GREEN}✨ Ready to code! Open http://localhost:8080/health to verify the API Gateway${NC}"
