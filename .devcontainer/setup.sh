#!/bin/bash

# NeatSpend Codespace Setup Script
# This script runs once when the Codespace is created

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Setting up NeatSpend development environment..."

echo -e "${BLUE}📦 Installing workspace dependencies...${NC}"
npm install --workspaces || true

echo -e "${BLUE}🔧 Setting up environment variables...${NC}"
# Create .env files for services if they don't exist
if [ ! -f "services/user-service/.env" ]; then
    cat > services/user-service/.env << EOF
NODE_ENV=development
PORT=3001
SERVICE_NAME=user-service
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neatspend_users?schema=public
JWT_SECRET=your-development-jwt-secret-change-in-production
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✅ Created user-service .env file${NC}"
fi

if [ ! -f "services/neatspend-api/.env" ]; then
    cat > services/neatspend-api/.env << EOF
NODE_ENV=development
PORT=8080
SERVICE_NAME=neatspend-api
USER_SERVICE_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neatspend?schema=public
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✅ Created neatspend-api .env file${NC}"
fi

# Check if Docker is available
echo -e "${BLUE}🐳 Checking Docker availability...${NC}"
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker is available!${NC}"
    
    echo -e "${BLUE}🐳 Building Docker images...${NC}"
    docker-compose build --parallel || echo -e "${YELLOW}⚠️  Docker build failed, will run services directly${NC}"
    
    echo -e "${BLUE}📋 Setting up databases...${NC}"
    # Start only PostgreSQL first
    docker-compose up -d postgres || echo -e "${YELLOW}⚠️  PostgreSQL with Docker failed${NC}"
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    timeout=60
    counter=0
    until docker-compose exec -T postgres pg_isready -U postgres -d neatspend > /dev/null 2>&1; do
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge $timeout ]; then
            echo -e "${YELLOW}⚠️  PostgreSQL startup timeout, but continuing...${NC}"
            break
        fi
    done
    
    if [ $counter -lt $timeout ]; then
        echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️  Docker not available, setting up for Node.js development${NC}"
    echo -e "${BLUE}📝 Installing development dependencies...${NC}"
    
    # Install nodemon globally for development
    npm install -g nodemon || echo -e "${YELLOW}⚠️  Could not install nodemon globally${NC}"
    
    echo -e "${YELLOW}📋 Note: You'll need to set up a PostgreSQL database separately${NC}"
    echo -e "${YELLOW}    You can use a cloud database or install PostgreSQL locally${NC}"
fi

echo -e "${BLUE}🧪 Running tests to verify setup...${NC}"
npm run test:all || echo -e "${YELLOW}⚠️  Some tests failed, but setup continues...${NC}"

echo -e "${GREEN}🎉 Setup complete!${NC}"

if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -e "${BLUE}🐳 Docker Mode - Your NeatSpend environment is ready!${NC}"
    echo -e "${BLUE}📚 Quick start commands:${NC}"
    echo "  • Start all services: docker-compose up"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • API Gateway: http://localhost:8080"
    echo "  • User Service: http://localhost:3001"
else
    echo -e "${BLUE}⚡ Node.js Mode - Your NeatSpend environment is ready!${NC}"
    echo -e "${BLUE}📚 Quick start commands:${NC}"
    echo "  • Start user service: cd services/user-service && npm run dev"
    echo "  • Start API gateway: cd services/neatspend-api && npm run dev"
    echo "  • Run all tests: npm run test:all"
    echo "  • Check status: npm run status"
fi

# Make the start script executable
chmod +x .devcontainer/start-services.sh 2>/dev/null || true
