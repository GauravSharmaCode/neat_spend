# NeatSpend API Gateway

A production-grade TypeScript API Gateway service that routes requests to appropriate microservices in the NeatSpend application. Built with Express.js, TypeScript, and designed for high availability and performance.

## ✨ Features

### Core Gateway Features
- ✅ **TypeScript**: Full type safety and modern development experience
- ✅ **Request Routing**: Intelligent routing to microservices with proxy middleware
- ✅ **Service Discovery**: Health checks and service connectivity monitoring
- ✅ **API Versioning**: Support for multiple API versions

### Reliability & Observability
- ✅ **Centralized Logging**: Structured logging with neat-logger integration
- ✅ **Circuit Breaker**: Protection against cascading service failures
- ✅ **Error Handling**: Comprehensive error handling and recovery
- ✅ **Graceful Shutdown**: Proper connection cleanup and shutdown procedures
- ✅ **Health Monitoring**: Advanced health checks for all services

### Security & Performance
- ✅ **Security**: CORS, Helmet security headers, and request validation
- ✅ **Rate Limiting**: Configurable rate limiting per endpoint
- ✅ **Response Compression**: Gzip compression for API responses
- ✅ **Docker Ready**: Containerization with multi-stage builds
- ✅ **Production Ready**: Battle-tested API Gateway patterns

### Recent Additions
- ✅ **Enhanced Proxy Logic**: Improved service routing with fallbacks
- ✅ **Metrics Collection**: Request duration and status code tracking
- ✅ **Improved Error Responses**: Standardized error format across services
- ✅ **Request Tracing**: Unique request IDs for cross-service tracing

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x with strict type checking
- **Framework**: Express.js with typed middleware
- **HTTP Proxy**: http-proxy-middleware for service routing
- **Logging**: @gauravsharmacode/neat-logger for structured logging
- **Security**: Helmet.js, CORS with typed configurations
- **Development**: ts-node-dev with hot reload
- **Testing**: Jest with TypeScript support
- **Code Quality**: ESLint + TypeScript ESLint rules
- **Containerization**: Docker with Alpine Linux

## 🏗️ Project Structure

```
neatspend-api/
├── src/
│   ├── config/              # TypeScript configuration files
│   │   └── index.ts         # Environment and service configuration
│   ├── types/               # TypeScript type definitions
│   │   └── neat-logger.d.ts # Logger type declarations
│   ├── interfaces.ts        # API Gateway interfaces and DTOs
│   └── index.ts             # Main API Gateway server (TypeScript)
├── dist/                    # Compiled JavaScript output
├── tests/                   # Jest test files
├── Dockerfile              # Docker build configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.mjs       # ESLint configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 📝 Architecture Overview

**API Gateway Pattern**: This service acts as a **pure API Gateway** - it does NOT contain business logic. All business operations are handled by dedicated microservices:

- **Route Proxying**: Forwards requests to appropriate microservices
- **Health Monitoring**: Checks connectivity to downstream services  
- **Cross-cutting Concerns**: Logging, CORS, security headers, error handling
- **Service Discovery**: Dynamic routing to healthy service instances

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- Running microservices (user-service, etc.)
- Docker (optional)

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server with TypeScript hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

### TypeScript Development

```bash
# Type checking without compilation
npx tsc --noEmit

# Watch mode for type checking
npx tsc --watch --noEmit

# Build and watch for changes
npm run build:watch
```

### Using Docker

```bash
# Build and start with Docker Compose (from root directory)
docker-compose up neatspend-api

# Or build standalone
docker build -t neatspend-api .
docker run -p 8080:8080 neatspend-api
```

## 🔧 Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=8080

# Service URLs (for proxy routing)
USER_SERVICE_URL=http://user-service:3001
SMS_SERVICE_URL=http://sms-service:8081
INSIGHT_SERVICE_URL=http://insight-service:8082

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# JWT (for validation at gateway level)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
```

## 📋 API Documentation

### Base URL
- Development: `http://localhost:8080`
- Health Check: `GET /health`

### Gateway Endpoints

#### Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "status": "success",
  "message": "NeatSpend API Gateway is running!",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2025-07-20T10:26:37.436Z",
  "services": {
    "user-service": "http://user-service:3001",
    "api-gateway": "http://localhost:8080"
  }
}
```

#### Health Check with Service Monitoring
```http
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "API Gateway is healthy",
  "service": "neatspend-api",
  "timestamp": "2025-07-20T10:26:37.436Z",
  "uptime": 3600.123,
  "memoryUsage": {
    "rss": 50331648,
    "heapTotal": 30932992,
    "heapUsed": 20176640,
    "external": 1286144,
    "arrayBuffers": 77896
  },
  "services": {
    "user-service": {
      "service": "user-service",
      "status": "healthy",
      "timestamp": "2025-07-20T10:26:37.436Z",
      "responseTime": 145
    }
  }
}
```

### Proxied Routes

All business logic routes are **proxied** to appropriate microservices:

#### Authentication Routes (→ user-service)
```http
POST /api/v1/auth/register     # → user-service:3001/auth/register
POST /api/v1/auth/login        # → user-service:3001/auth/login
POST /api/v1/auth/logout       # → user-service:3001/auth/logout
```

#### User Management Routes (→ user-service)
```http
GET    /api/v1/users           # → user-service:3001/users
POST   /api/v1/users           # → user-service:3001/users
GET    /api/v1/users/:id       # → user-service:3001/users/:id
PUT    /api/v1/users/:id       # → user-service:3001/users/:id
DELETE /api/v1/users/:id       # → user-service:3001/users/:id
GET    /api/v1/users/me        # → user-service:3001/users/me
```

#### Legacy Deprecation
```http
GET /users                     # Returns 410 deprecation notice
```

### Request/Response Flow

1. **Client Request** → API Gateway (TypeScript)
2. **Route Analysis** → Determine target microservice
3. **Proxy Middleware** → Forward request using http-proxy-middleware
4. **Service Response** → Receive response from microservice
5. **Response Processing** → Handle errors, logging, and formatting
6. **Client Response** → Return processed response with proper types

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage  
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Type checking
npm run lint
npm run lint:fix
```

### Test Structure
- **Unit Tests**: TypeScript interface validation
- **Integration Tests**: Proxy middleware functionality  
- **Health Check Tests**: Service connectivity monitoring
- **Error Handling Tests**: Circuit breaker and fallback validation

## 🐳 Docker

### Dockerfile Features
- **Lightweight**: Alpine Linux base image
- **Security**: Non-root user execution
- **Optimization**: Multi-stage build process
- **Health Checks**: Built-in container health monitoring

### Docker Compose Integration
```yaml
neatspend-api:
  build: ./services/neatspend-api
  ports:
    - "8080:8080"
  environment:
    - USER_SERVICE_URL=http://user-service:3001
  depends_on:
    user-service:
      condition: service_healthy
```

## 📊 Monitoring & Logging

### Health Monitoring
- **Service Health**: Continuous health checks of dependent services
- **Response Time**: Request/response latency tracking
- **Error Rates**: Failed request monitoring
- **Uptime Tracking**: Service availability metrics

### Logging Strategy
```javascript
const logger = require('@neat-spend/logger');

// Request logging with metadata
logger.info('API request processed', {
  service: 'neatspend-api',
  method: req.method,
  url: req.url,
  statusCode: res.statusCode,
  responseTime: responseTime,
  userAgent: req.get('User-Agent')
});
```

### Log Types
- **Request Logs**: HTTP request/response details
- **Service Communication**: Microservice interaction logs
- **Error Logs**: Detailed error information and stack traces
- **Health Logs**: Service health check results

## 🔒 Security Features

### Request Security
- **CORS Protection**: Configurable cross-origin request handling
- **Security Headers**: Helmet.js security middleware
- **Request Validation**: Input sanitization and validation
- **Rate Limiting**: Protection against abuse (configurable)

### Service Communication
- **Secure Headers**: Proper header forwarding to services
- **Authentication Passthrough**: JWT token forwarding
- **Error Sanitization**: Secure error message handling

## 🚀 Performance Features

### Optimization
- **Connection Pooling**: Efficient HTTP client configuration
- **Response Compression**: Gzip compression for responses
- **Caching Strategy**: Ready for Redis integration
- **Graceful Shutdown**: Proper connection cleanup

### Scalability
- **Stateless Design**: Horizontal scaling capability
- **Service Discovery**: Dynamic service endpoint management
- **Load Balancing**: Ready for load balancer integration

## 🔄 Service Communication

### HTTP Client Configuration
```javascript
const axios = require('axios');

const userServiceClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Error Handling
- **Service Unavailable**: Graceful handling of downstream failures
- **Timeout Handling**: Request timeout management
- **Retry Logic**: Configurable retry mechanisms
- **Circuit Breaker**: Protection against cascading failures

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start with TypeScript hot reload
npm run dev:debug        # Start with debugger

# Building & Production
npm run build            # Compile TypeScript to JavaScript  
npm run build:watch      # Watch mode compilation
npm run start            # Start production server (requires build)

# Code Quality
npm run lint             # ESLint + TypeScript checks
npm run lint:fix         # Auto-fix linting issues

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Generate coverage report

# Utilities
npm run clean            # Clean dist directory
```

### TypeScript Development Workflow
1. **Code in TypeScript**: Write type-safe code in `src/`
2. **Hot Reload**: Use `npm run dev` for instant feedback
3. **Type Checking**: Continuous type validation with strict mode
4. **Build**: Compile to `dist/` with `npm run build`
5. **Deploy**: Run production build with `npm start`

### Adding New Services
1. **Add Service Configuration**: Update environment variables
2. **Create Route Handler**: Add routing logic for new service
3. **Add Health Check**: Include service in health monitoring
4. **Write Tests**: Add comprehensive integration tests
5. **Update Documentation**: Document new endpoints

## 📝 Error Handling

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "service": "source-service",
  "timestamp": "2025-07-16T08:00:00.000Z"
}
```

### Common Error Scenarios
- **Service Unavailable**: Downstream service is down
- **Request Timeout**: Service response timeout
- **Invalid Route**: Endpoint not found
- **Validation Error**: Request validation failed
- **Authentication Error**: Invalid or missing token

## 🔧 Configuration

### Service Endpoints
```javascript
const services = {
  userService: {
    url: process.env.USER_SERVICE_URL,
    healthPath: '/health',
    timeout: 5000
  }
  // Add more services as they're implemented
};
```

### Route Mapping
```javascript
const routes = [
  {
    path: '/api/users/*',
    service: 'userService',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
  // Add more route mappings
];
```

## 🌐 API Gateway Pattern Benefits

- **Single Entry Point**: Centralized access to all microservices
- **Cross-cutting Concerns**: Authentication, logging, monitoring in one place
- **Service Abstraction**: Clients don't need to know individual service locations
- **Protocol Translation**: Handle different protocols between client and services
- **Load Distribution**: Distribute load across service instances

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Microservices Communication Patterns](https://microservices.io/patterns/communication-style/messaging.html)

---

**Part of the NeatSpend microservices ecosystem** 🚀
