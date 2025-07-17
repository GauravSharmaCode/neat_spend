#!/bin/bash

# NeatSpend Services Auto-Start Script
# This script runs every time the Codespace starts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting NeatSpend services...${NC}"

# Check if Docker is available and working
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 Docker found, checking if daemon is running...${NC}"
    
    # Wait for Docker daemon to be ready
    timeout=30
    counter=0
    while ! docker info > /dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            echo -e "${YELLOW}⚠️  Docker daemon not ready, falling back to Node.js mode${NC}"
            break
        fi
        echo -e "${YELLOW}⏳ Waiting for Docker daemon... ($counter/${timeout}s)${NC}"
        sleep 2
        counter=$((counter + 2))
    done
    
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is ready!${NC}"
        
        # Docker mode
        echo -e "${BLUE}🐳 Starting Docker Compose services...${NC}"
        if docker-compose up -d; then
            echo -e "${GREEN}✅ Services started with Docker!${NC}"
            
            # Wait a moment for services to initialize
            sleep 5
            
            # Check service status
            echo -e "${BLUE}📊 Service Status:${NC}"
            docker-compose ps
            
            # Health checks
            echo -e "\n${BLUE}🔍 Health Checks:${NC}"
            sleep 10
            
            # Check PostgreSQL
            if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
                echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
            else
                echo -e "${YELLOW}⚠️  PostgreSQL is starting up...${NC}"
            fi
            
            # Check services
            if curl -f -s "http://localhost:3001/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ User Service is healthy${NC}"
            else
                echo -e "${YELLOW}⚠️  User Service is starting up...${NC}"
            fi
            
            if curl -f -s "http://localhost:8080/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ API Gateway is healthy${NC}"
            else
                echo -e "${YELLOW}⚠️  API Gateway is starting up...${NC}"
            fi
            
            echo -e "\n${BLUE}🌐 Available endpoints:${NC}"
            echo "  • API Gateway Health: http://localhost:8080/health"
            echo "  • User Service Health: http://localhost:3001/health"
            echo "  • View logs: docker-compose logs -f"
            echo "  • Stop services: docker-compose down"
            
            exit 0
        else
            echo -e "${YELLOW}⚠️  Docker Compose failed, falling back to Node.js mode${NC}"
        fi
    fi
fi

# Node.js fallback mode
echo -e "${BLUE}⚡ Starting in Node.js development mode...${NC}"
echo -e "${YELLOW}📋 Note: You'll need to start services manually or set up PostgreSQL${NC}"

echo -e "\n${BLUE}🛠️  Available Commands:${NC}"
echo "  • Start user service: cd services/user-service && npm run dev"
echo "  • Start API gateway: cd services/neatspend-api && npm run dev"
echo "  • Run tests: npm run test:all"
echo "  • Check status: npm run status"

echo -e "\n${BLUE}🎯 Quick Start (run in separate terminals):${NC}"
echo "  Terminal 1: cd services/user-service && npm run dev"
echo "  Terminal 2: cd services/neatspend-api && npm run dev"

echo -e "\n${GREEN}✨ Environment ready for development!${NC}"
echo -e "${BLUE}💡 Tip: Use 'Ctrl+Shift+\`' to open multiple terminals${NC}"
