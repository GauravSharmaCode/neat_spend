# NeatSpend - Microservices Monorepo

This is a monorepo containing all NeatSpend microservices. Each service is independently deployable but shares common tooling and infrastructure.

## 🏗️ Architecture

```
neat_spend/
├── services/                 # All microservices
│   ├── user-service/         # User management
│   ├── neatspend-api/        # API Gateway
│   ├── auth-verifier-service/# Authentication verification
│   ├── sms-parser-service/   # SMS parsing and processing
│   ├── pubsub-handler-service/# Pub/Sub message handling
│   ├── ai-insight-service/   # AI-powered insights
│   └── sms-sync-worker/      # SMS synchronization
├── shared/                   # Shared utilities
│   └── database/             # Database utilities
├── archived/                 # Deprecated packages
├── deployment/               # Infrastructure as Code
│   ├── docker-compose.yml    # Local development
│   ├── kubernetes/           # K8s manifests
│   └── terraform/            # Cloud infrastructure
├── scripts/                  # Build and deployment scripts
└── .github/                  # CI/CD workflows
```

## 🚀 Benefits of Monorepo Approach

### For Development
- **Single Clone**: One `git clone` gets you everything
- **Atomic Changes**: Update multiple services in a single commit
- **Shared Tooling**: Common linting, testing, and build tools
- **Cross-Service Refactoring**: Easy to update APIs across services

### For Operations
- **Unified CI/CD**: Single pipeline that can deploy any service
- **Consistent Versioning**: All services can share version numbers
- **Shared Infrastructure**: Common Docker images, configs, etc.

### For Teams
- **Knowledge Sharing**: Easier to see how other services work
- **Consistent Patterns**: All services follow the same structure
- **Easier Onboarding**: New developers get the full picture

## 📦 Service Independence

Even though services share a repo, they maintain independence:

```yaml
# Each service has its own:
services/user-service/
├── package.json          # Independent dependencies
├── Dockerfile           # Independent deployment
├── prisma/schema.prisma # Independent database
├── .env.example         # Independent configuration
└── README.md           # Independent documentation
```

## 🔄 Deployment Options

### Independent Deployment
```bash
# Deploy only user service
docker-compose up user-service

# Deploy specific services
docker-compose up user-service api-gateway postgres
```

### Service-Specific CI/CD
```yaml
# .github/workflows/user-service.yml
name: User Service CI/CD
on:
  push:
    paths: ['services/user-service/**']
jobs:
  test-and-deploy:
    # Only runs when user-service changes
```

## 🛠️ Development Workflow

### Local Development
```bash
# Start all services
npm run dev:all

# Start specific service
npm run dev:user-service

# Run tests for all services
npm run test:all

# Run tests for specific service
npm run test:user-service
```

### Adding New Services
```bash
# Use service generator
npm run create-service transaction-service

# Or copy existing service structure
cp -r services/user-service services/new-service
```

## 🌟 Best Practices

1. **Service Autonomy**: Each service owns its data and business logic
2. **API Contracts**: Use OpenAPI specs for service interfaces  
3. **Event-Driven**: Services communicate via events, not direct calls
4. **Shared Libraries**: Common code goes in `shared/` directory
5. **Independent Deployment**: Each service can be deployed separately
6. **Centralized Logging**: All services use `@gauravsharmacode/neat-logger` for consistent logging

## 📋 Logging Strategy

All services use the standardized `@gauravsharmacode/neat-logger` package:

```javascript
const { createLogger } = require('@gauravsharmacode/neat-logger');

const logger = createLogger({
  service: 'your-service-name',
  level: process.env.LOG_LEVEL || 'info'
});

logger.info('Operation completed', { userId, operation: 'login' });
```

Benefits:
- ✅ Consistent log format across all services
- ✅ Structured JSON logging for easy parsing
- ✅ Configurable log levels per service
- ✅ Built-in performance and request logging

## 🔮 Migration Path

If you later want to split into separate repos:

```bash
# Extract service to new repo (preserves git history)
git subtree push --prefix=services/user-service origin user-service-repo
```

This gives you the flexibility to evolve your architecture as your team grows.
