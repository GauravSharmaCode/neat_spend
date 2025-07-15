# NeatSpend — Production-Grade Microservices Monorepo

> Modern, scalable personal finance tracker built with microservices architecture. All services managed in a single repository for streamlined development and deployment.

---

## 🧭 Project Overview

- **Goal:** AI-powered personal finance tracking with microservices
- **Architecture:** Independent microservices with API Gateway
- **Dev Strategy:** Docker, monorepo with service independence  
- **Logging:** Standardized with `@gauravsharmacode/neat-logger`

---

## 📦 Repository Structure

```
neat_spend/
├── services/                     # All microservices
│   ├── user-service/             # User management & authentication
│   ├── neatspend-api/           # API Gateway & request routing
│   ├── auth-verifier-service/   # Authentication verification
│   ├── sms-parser-service/      # SMS → transaction parsing
│   ├── pubsub-handler-service/  # Pub/Sub message handling  
│   ├── ai-insight-service/      # AI-powered insights
│   └── sms-sync-worker/         # SMS synchronization
├── shared/                      # Shared utilities
│   └── database/                # Database connection utilities
├── apps/                        # Frontend applications
│   ├── web/                     # Next.js web app
│   └── mobile/                  # React Native mobile app
├── scripts/                     # Development & deployment scripts
├── .github/workflows/           # CI/CD pipelines
└── docker-compose.yml           # Local orchestration
```

---

## 🚀 Quick Start

### 1. Setup All Services
```sh
# Install dependencies for all services
npm run install:all

# Start all services with Docker
npm run docker:up

# Or start specific services for development
npm run dev:user-service
npm run dev:api
```

### 2. Access Services
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001  
- **Health Checks**: `/health` endpoint on each service

### 3. Test Architecture
```sh
# Test service communication
npm run test:services

# Run tests for specific service
npm run test:user-service
```

---

## 🏗️ Service Architecture

### API Gateway (`neatspend-api`)
- Routes requests to appropriate microservices
- Handles authentication and rate limiting
- Provides service discovery

### User Service (`user-service`)
- User registration, authentication & management
- JWT token generation and validation
- User profile management

### Other Services
- **Auth Verifier**: JWT verification utilities
- **SMS Parser**: Converts SMS to transaction data
- **Pub/Sub Handler**: Manages event-driven communication
- **AI Insights**: Generates financial insights

---

## 📋 Logging Strategy

All services use standardized logging via `@gauravsharmacode/neat-logger`:

```javascript
const { logWithMeta } = require('@gauravsharmacode/neat-logger');

logWithMeta('User created successfully', {
  func: 'createUser',
  level: 'info',
  extra: { userId, email }
});
```

**Benefits:**
- ✅ Consistent structured JSON logs across all services
- ✅ Function-level logging with metadata
- ✅ Configurable log levels per service
- ✅ Built-in performance tracking

---

## �️ Development Workflow

### Creating New Services
```sh
# Generate new service with boilerplate
npm run create-service transaction-service
```

### Testing
```sh
# Test all services
npm run test:all

# Test specific service  
npm run test:user-service
```

### Database Migrations
```sh
# Run migrations for user service
npm run db:migrate:user-service
```

---

## 🔄 Deployment

### Local Development
```sh
npm run docker:up
```

### Production
- Each service has independent Docker containers
- CI/CD pipeline deploys only changed services
- Health checks ensure service reliability

---

## 🌟 Benefits of This Architecture

- **🔒 Service Independence**: Each service can be developed, tested, and deployed separately
- **📈 Scalable**: Scale individual services based on demand
- **🚀 Fast Development**: Shared tooling and consistent patterns
- **🔍 Observable**: Centralized logging and monitoring
- **🛡️ Resilient**: Circuit breakers and health checks

---

## � Documentation

- Each service has its own `README.md` with API documentation
- See `MICROSERVICES.md` for architecture details
- Check `CONTRIBUTING.md` for development guidelines

---

## License

MIT
