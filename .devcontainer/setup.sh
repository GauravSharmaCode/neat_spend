#!/bin/bash

# NeatSpend Codespace Setup Script
# This script runs once when the Codespace is created

set -e

echo "🚀 Setting up NeatSpend development environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

echo -e "${BLUE}🐳 Building Docker images...${NC}"
# Build all Docker images
docker-compose build --parallel

echo -e "${BLUE}📋 Setting up databases...${NC}"
# Start only PostgreSQL first
docker-compose up -d postgres

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

echo -e "${BLUE}🗄️  Running database migrations...${NC}"
# Run Prisma migrations if they exist
if [ -f "services/user-service/prisma/schema.prisma" ]; then
    cd services/user-service
    if command -v npx &> /dev/null; then
        npx prisma migrate dev --name init || echo -e "${YELLOW}⚠️  Migration skipped (might already exist)${NC}"
        npx prisma generate || echo -e "${YELLOW}⚠️  Prisma generate skipped${NC}"
    fi
    cd ../..
fi

echo -e "${BLUE}🧪 Running tests to verify setup...${NC}"
npm run test:all || echo -e "${YELLOW}⚠️  Some tests failed, but setup continues...${NC}"

echo -e "${GREEN}🎉 Setup complete! Your NeatSpend environment is ready!${NC}"
echo -e "${BLUE}📚 Quick start commands:${NC}"
echo "  • Start all services: docker-compose up"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • API Gateway: http://localhost:8080"
echo "  • User Service: http://localhost:3001"

# Make the start script executable
chmod +x .devcontainer/start-services.sh 2>/dev/null || true
