# NeatSpend — Production-Grade Microservices Monorepo

> Modern, scalable personal finance tracker built with microservices architecture. Fully refactored with npm workspaces, standardized logging, and Docker orchestration.

---

## 🧭 Project Overview

- **Architecture:** Microservices with API Gateway pattern
- **Workspace:** npm workspaces for dependency management
- **Logging:** Standardized with neat-logger shared package
- **Containerization:** Docker Compose for local development
- **Testing:** Jest with comprehensive test coverage

---

## 📦 Repository Structure

```
neat_spend/
├── services/                     # All microservices
│   ├── user-service/             # User management & authentication ✅
│   ├── neatspend-api/           # API Gateway & request routing ✅
│   ├── ai-insight-service/      # AI-powered insights (planned)
│   ├── sms-sync-worker/         # SMS synchronization (planned)
│   └── shared-utils/            # Shared utilities & helpers ✅
├── utils/                       # Workspace utilities
│   └── logger/                  # Centralized logging package ✅
├── apps/                        # Frontend applications (planned)
│   ├── web/                     # Next.js web app
│   └── mobile/                  # React Native mobile app
├── infra/                       # Infrastructure configs
├── docker-compose.yml           # Local orchestration ✅
└── package.json                 # Workspace configuration ✅
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```sh
# Install all workspace dependencies
npm install

# Verify workspace structure
npm run workspace:info
```

### 2. Start Services
```sh
# Start all services with Docker Compose
docker-compose up -d

# Check service health
npm run health:check

# View logs
docker-compose logs -f
```

### 3. Development Commands
```sh
# Run tests for all services
npm run test:all

# Lint all services
npm run lint:all

# Start individual service for development
npm run dev:user-service
npm run dev:api
```

### 4. Access Services
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001  
- **Database**: postgresql://postgres:postgres@localhost:5432/neatspend
- **Health Checks**: `/health` endpoint on each service

---

## 🏗️ Service Architecture

### Currently Implemented

#### User Service (`user-service`)
- User registration and authentication
- JWT token management
- Prisma ORM with PostgreSQL
- RESTful API with Express.js
- Health checks and monitoring

#### API Gateway (`neatspend-api`)
- Request routing to microservices
- Service discovery and health checks
- Centralized error handling
- Request/response logging

#### Shared Utils (`shared-utils`)
- Common utilities across services
- Database connection helpers
- Shared constants and types

#### Logger Utility (`utils/logger`)
- Structured JSON logging
- Service-specific log formatting
- Configurable log levels
- Performance monitoring

### Planned Services
- **AI Insight Service**: Financial analytics and insights
- **SMS Sync Worker**: Transaction extraction from SMS
- **Web App**: Next.js frontend
- **Mobile App**: React Native application

---

## 📋 Logging Strategy

All services use the shared logging utility from `utils/logger`:

```javascript
const logger = require('@neat-spend/logger');

logger.info('User created successfully', {
  service: 'user-service',
  function: 'createUser',
  userId: user.id,
  email: user.email
});
```

**Benefits:**
- ✅ Consistent structured JSON logs across all services
- ✅ Service-specific log formatting
- ✅ Configurable log levels per service
- ✅ Built-in error tracking and performance monitoring

---

## 📋 Technology Stack

### Backend Services
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Logging**: Custom structured logging
- **Testing**: Jest with supertest
- **Linting**: ESLint with flat config

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: npm workspaces
- **Development**: Hot reload with nodemon
- **Health Checks**: Custom health monitoring
- **Database Migrations**: Prisma migrate

### Code Quality
- **Linting**: ESLint across all services
- **Testing**: Unit and integration tests
- **Error Handling**: Centralized error middleware
- **Logging**: Structured JSON logging
- **Dependencies**: Managed via npm workspaces

---

## 🛠️ Development Workflow

### Working with Services
```sh
# Add dependency to specific service
npm install express --workspace=services/user-service

# Run service-specific commands
npm run test --workspace=services/user-service
npm run lint --workspace=services/user-service

# Build service for production
npm run build --workspace=services/user-service
```

### Database Operations
```sh
# Generate Prisma client
npm run db:generate --workspace=services/user-service

# Run database migrations
npm run db:migrate --workspace=services/user-service

# Reset database (development only)
npm run db:reset --workspace=services/user-service
```

### Testing Strategy
```sh
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:user-service
npm run test:api
```

---

## 🔄 Deployment

### Local Development
```sh
# Start all services
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
- **Docker**: Each service has optimized multi-stage Dockerfiles
- **Health Checks**: Built-in health monitoring for all services
- **Database**: PostgreSQL with Prisma migrations
- **Monitoring**: Structured logging with centralized collection

### Environment Variables
```sh
# User Service
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secure-secret
PORT=3001

# API Gateway
NODE_ENV=production
USER_SERVICE_URL=http://user-service:3001
PORT=8080
```

---

## 🌟 Benefits of This Architecture

- **🔧 Monorepo Management**: Single repository with npm workspaces
- **🔒 Service Independence**: Each service can be developed and deployed separately
- **📈 Scalable**: Scale individual services based on demand
- **🚀 Fast Development**: Shared utilities and consistent patterns
- **🔍 Observable**: Centralized logging and comprehensive health checks
- **🛡️ Resilient**: Docker containerization with health monitoring
- **🧪 Testable**: Comprehensive test coverage with Jest

---

## 📚 Documentation

- **Main README**: This file - overview and quick start
- **Service READMEs**: Each service has detailed API documentation
- **Docker Setup**: `docker-compose.yml` with full service orchestration
- **Package Management**: `package.json` with workspace configuration

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow conventions**: Use ESLint, write tests, update docs
4. **Test changes**: `npm run test:all && npm run lint:all`
5. **Submit PR**: Include description of changes and testing done

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for modern microservices development**
