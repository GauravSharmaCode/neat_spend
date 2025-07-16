#!/bin/bash

# NeatSpend Status Check Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║         NeatSpend Status Dashboard       ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check Docker status
echo -e "${BLUE}🐳 Docker Status:${NC}"
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is running${NC}"
else
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check services
echo -e "\n${BLUE}📊 Service Status:${NC}"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Health checks
echo -e "\n${BLUE}🔍 Health Checks:${NC}"

check_health() {
    local service_name=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  $service_name is not responding${NC}"
    fi
}

check_health "API Gateway" "http://localhost:8080/health"
check_health "User Service" "http://localhost:3001/health"

# Show useful commands
echo -e "\n${BLUE}🛠️  Useful Commands:${NC}"
echo "• View logs: npm run docker:logs"
echo "• Restart services: npm run docker:restart"
echo "• Check health: npm run codespace:health"
echo "• Stop services: npm run docker:down"

echo -e "\n${BLUE}🌐 Access URLs:${NC}"
echo "• API Gateway: http://localhost:8080"
echo "• User Service: http://localhost:3001"
echo "• Health Check: http://localhost:8080/health"

echo -e "\n${GREEN}🎉 Happy coding!${NC}"
