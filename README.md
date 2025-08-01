# NeatSpend — Production-Grade Microservices Monorepo

> Modern, scalable personal finance tracker built with microservices architecture. Fully refactored with npm workspaces, standardized logging, and Docker orchestration.

---

## 🧭 Project Overview

- **Architecture:** Microservices with API Gateway pattern
- **Workspace:** npm workspaces for dependency management
- **Logging:** Standardized with neat-logger shared package
- **Containerization:** Docker Compose for local development
- **Testing:** Jest with comprehensive test coverage

## 🏗️ Architecture Diagram

```mermaid
graph TB
    Client["🌐 Client Applications<br/>(Web/Mobile)"] --> Gateway["⚡ Nginx API Gateway<br/>:8080"]

    Gateway --> UserService["👤 User Service<br/>:3001<br/>(Auth + User Management)"]
    Gateway --> SMSWorker["📱 SMS Sync Worker<br/>:4002"]

    UserService --> Database[("🗄️ PostgreSQL<br/>:5432")]
    SMSWorker --> Firestore[("🔥 Firestore<br/>(Google Cloud)")]
    SMSWorker --> UserService

    Gateway --> HealthCheck["🏥 Health Check<br/>:8090"]

    subgraph "Docker Network"
        Gateway
        UserService
        SMSWorker
        Database
    end

    style Client fill:#e1f5fe
    style Gateway fill:#f3e5f5
    style UserService fill:#e8f5e8
    style SMSWorker fill:#e8f5e8
    style Database fill:#fff3e0
    style Firestore fill:#fff3e0
    style HealthCheck fill:#fce4ec
```

## 🔄 Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx Gateway
    participant U as User Service
    participant S as SMS Sync Worker
    participant D as Database
    participant F as Firestore

    Note over C,F: Authentication Flow
    C->>N: POST /api/v1/auth/login
    N->>U: POST /auth/login
    U->>D: Query user credentials
    D-->>U: User data
    U-->>N: JWT token + user info
    N-->>C: Authentication response

    Note over C,F: User Profile Request
    C->>N: GET /api/v1/users/me<br/>Authorization: Bearer <token>
    N->>U: GET /users/me<br/>Authorization: Bearer <token>
    Note over U: Validate JWT token internally
    U->>D: Query user profile
    D-->>U: User profile data
    U-->>N: User profile response
    N-->>C: User profile data

    Note over C,F: SMS Sync Request
    C->>N: POST /api/v1/sms-sync/full<br/>Authorization: Bearer <token>
    N->>S: POST /full<br/>Authorization: Bearer <token>
    S->>U: Validate JWT token
    U-->>S: User validation response
    S->>F: Store SMS messages
    F-->>S: Storage confirmation
    S-->>N: Sync success response
    N-->>C: SMS sync completed
```

---

## 📦 Repository Structure

```
neat_spend/
├── services/                     # Microservices (npm workspaces)
│   ├── user-service/             # User management & authentication ✅
│   ├── nginx-gateway/           # Nginx API Gateway & request routing ✅

│   ├── ai-insight-service/      # Financial analytics and insights 🚧
│   └── sms-sync-worker/         # Transaction extraction from SMS ✅
├── apps/                        # Frontend applications (planned)
│   ├── web/                     # Next.js web app 🚧
│   └── mobile/                  # React Native mobile app 🚧
├── infra/                       # Infrastructure configurations
│   └── cloud-run-configs/       # Google Cloud Run deployment configs 🚧
├── scripts/                     # Utility scripts for development
├── .github/workflows/           # CI/CD pipelines ✅
├── .devcontainer/              # Codespaces configuration ✅
├── docker-compose.yml          # Local orchestration ✅
└── package.json                # Workspace configuration ✅
```

✅ = Implemented and ready to use | 🚧 = In development

---

## 🚀 Quick Start

### 1. Install Dependencies

```sh
# Install all workspace dependencies (automatically handles all services)
npm install

# For CI/CD environments
npm ci
```

### 2. Start Services

```sh
# Start all services with Docker Compose
docker-compose up -d

# Or start services in development mode
npm run dev:all

# Check service health
npm run codespace:health
```

### 3. Development Commands

```sh
# Run tests for all services
npm run test:all

# Run tests in CI mode
npm run test:ci

# Lint all services
npm run lint:all

# Build all services for production
npm run build:all

# Start individual service for development
npm run dev:user-service
npm run dev:sms-sync-worker
```

### 4. Access Services

- **Nginx API Gateway**: http://localhost:8080
- **Gateway Health Check**: 
  - External: http://localhost:8080/health (public-facing)
  - Internal: http://localhost:8090/nginx-health (container health check)
- **User Service**: http://localhost:3001
- **SMS Sync Worker**: http://localhost:4002
- **Database**: postgresql://postgres:postgres@localhost:5432/neatspend
- **Health Checks**: `/health` endpoint on each service

### 5. Available Endpoints

| Endpoint                        | Service                       | Description                        | Status     |
| ------------------------------- | ----------------------------- | ---------------------------------- | ---------- |
| `GET /`                         | Nginx Gateway                 | Service info                       | ✅ Working |
| `GET /health`                   | Nginx Gateway                 | Gateway health status              | ✅ Working |
| `GET /nginx-health`             | Nginx Gateway                 | Internal health check (port 8090)  | ✅ Working |
| `GET /`                         | User Service                  | Service info and health status     | ✅ Working |
| `GET /health`                   | User Service                  | Detailed health with uptime/memory | ✅ Working |
| `POST /api/v1/auth/register`    | User Service (via Gateway)    | User registration                  | ✅ Working |
| `POST /api/v1/auth/login`       | User Service (via Gateway)    | JWT authentication                 | ✅ Working |
| `GET /api/v1/users/me`          | User Service (via Gateway)    | Get current user profile           | ✅ Working |
| `GET /api/v1/users`             | User Service (via Gateway)    | List users (admin only)            | ✅ Working |
| `POST /api/v1/sms-sync/full`    | SMS Sync Worker (via Gateway) | Bulk sync all SMS messages (replaces existing) | ✅ Working |
| `POST /api/v1/sms-sync/message` | SMS Sync Worker (via Gateway) | Sync single SMS message            | ✅ Working |
| `GET /api/v1/sms-sync/messages` | SMS Sync Worker (via Gateway) | Get user's SMS messages from Firestore | ✅ Working |
| `PATCH /api/v1/sms-sync/message/:id` | SMS Sync Worker (via Gateway) | Update specific SMS message | ✅ Working |
| `DELETE /api/v1/sms-sync/message/:id` | SMS Sync Worker (via Gateway) | Delete specific SMS message | ✅ Working |

### 🔐 Authentication Flow

- **JWT tokens are issued by the User Service** and used across all microservices
- **SMS Sync Worker validates tokens** by calling the User Service
- **No external auth providers** - all authentication is internal
- **Stateless authentication** with JWT tokens containing user ID and metadata

**Recent Fixes:**

- ✅ Nginx gateway now properly routes `/api/v1/users/*` to `/users/*`
- ✅ Nginx gateway now properly routes `/api/v1/auth/*` to `/auth/*`
- ✅ Error responses now return proper JSON format
- ✅ Authentication and authorization working correctly

---

## 🏗️ Service Architecture

### Currently Implemented

#### User Service (`user-service`)

- User registration and authentication
- JWT token management
- Prisma ORM with PostgreSQL
- RESTful API with Express.js
- Health checks and monitoring

#### Nginx API Gateway (`nginx-gateway`)

- High-performance request routing to microservices
- Built-in rate limiting and load balancing
- Security headers and CORS handling
- Health monitoring and logging

#### SMS Sync Worker (`sms-sync-worker`)

- SMS message synchronization with Firestore
- JWT authentication with User Service integration
- RESTful API for message CRUD operations
- Bulk and single message sync capabilities
- User-specific message isolation and security

### Planned Services

#### AI Insight Service (`ai-insight-service`) - In Development

- Financial analytics and insights
- Machine learning for spending patterns
- Budget recommendations
- Anomaly detection for transactions

#### Web App (`apps/web`) - In Development

- Next.js frontend application
- Responsive dashboard
- Financial visualization
- User account management

#### Mobile App (`apps/mobile`) - In Development

- React Native mobile application
- Push notifications for transactions
- Offline support
- Biometric authentication

---

## 📋 Logging Strategy

All services use the shared logging utility:

```javascript
// Using published npm package
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

logWithMeta("info", "User created successfully", {
  service: "user-service",
  function: "createUser",
  userId: user.id,
  email: user.email,
});
```

**Note**: `@gauravsharmacode/neat-logger` is a published npm package providing structured logging across all services.

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
# npm workspaces automatically manages dependencies
npm install                       # Installs all workspace deps
npm ci                           # CI-friendly install

# Run workspace-specific commands
npm run test --workspace=services/user-service
npm run lint --workspace=services/neatspend-api
npm run build --workspace=services/user-service

# Or use convenience scripts
npm run test:user-service
npm run lint:api
npm run build:all
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

## ⚙️ CI/CD & Development Environment

### GitHub Actions

- **Automated testing** on every push and PR
- **Multi-stage pipeline**: lint → test → build
- **npm workspaces optimized** with `npm ci`
- **Production-ready builds** with quality gates

### GitHub Codespaces

- **One-click development environment**
- **Docker-in-Docker support** for full containerization
- **Pre-configured devcontainer** with all tools
- **Automatic service startup** and health checks

### Build Process

```sh
# Each service build includes:
npm run prisma:generate     # Generate Prisma client
npm run test               # Run all tests
npm run lint               # Code quality checks
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
- **⚡ High Performance**: Nginx-based API gateway with optimized routing
- **🔐 Secure**: JWT authentication with role-based access control

---

## 📚 Documentation

### Main Documentation

- **Main README**: This file - overview and quick start
- **MICROSERVICES.md**: Detailed explanation of the microservices architecture
- **QUICK_START.md**: Fast setup guide for new developers
- **PROJECT_STATUS.md**: Current project status and roadmap
- **CONTRIBUTING.md**: Guidelines for contributing to the project

### Service Documentation

- **Service READMEs**: Each service has detailed API documentation
  - [User Service](services/user-service/README.md)
  - [Nginx Gateway](services/nginx-gateway/README.md)
  - [SMS Sync Worker](services/sms-sync-worker/README.md)

### Infrastructure

- **Docker Setup**: `docker-compose.yml` with full service orchestration
- **Package Management**: `package.json` with workspace configuration
- **Devcontainer**: [.devcontainer/README.md](.devcontainer/README.md) for Codespaces setup
- **Cloud Deployment**: [infra/cloud-run-configs/README.md](infra/cloud-run-configs/README.md) for production deployment

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
