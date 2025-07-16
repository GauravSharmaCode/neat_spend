# NeatSpend API Gateway

A production-grade API Gateway service that routes requests to appropriate microservices in the NeatSpend application. Built with Express.js and designed for high availability and performance.

## ✨ Features

- ✅ Request routing to microservices
- ✅ Service discovery and health checks
- ✅ Centralized error handling and logging
- ✅ Request/response middleware
- ✅ CORS and security headers
- ✅ Health monitoring and uptime tracking
- ✅ Graceful shutdown handling
- ✅ Docker containerization
- ✅ Production-ready architecture

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **HTTP Client**: Axios for service communication
- **Logging**: Shared neat-logger utility
- **Security**: Helmet, CORS
- **Testing**: Jest with supertest
- **Containerization**: Docker with Alpine Linux

## 🏗️ Project Structure

```
neatspend-api/
├── src/
│   ├── routes/              # API route definitions
│   ├── middleware/          # Express middleware
│   ├── services/            # Service communication logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── index.js             # Application entry point
├── tests/                   # Test files
├── Dockerfile              # Docker build configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

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

# Start development server
npm run dev
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
SERVICE_NAME=neatspend-api

# Microservice URLs
USER_SERVICE_URL=http://user-service:3001

# Logging
LOG_LEVEL=info
```

## 📋 API Documentation

### Base URL
- Development: `http://localhost:8080`
- Health Check: `GET /health`

### Gateway Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "API Gateway is healthy",
  "timestamp": "2025-07-16T08:00:00.000Z",
  "uptime": 3600.123,
  "services": {
    "user-service": "healthy"
  }
}
```

### User Service Routes

All user-related requests are proxied to the user-service:

#### User Registration
```http
POST /api/users/register
```
→ Proxied to `user-service:3001/api/users/register`

#### User Login
```http
POST /api/users/login
```
→ Proxied to `user-service:3001/api/users/login`

#### User Profile
```http
GET /api/users/profile
Authorization: Bearer {jwt-token}
```
→ Proxied to `user-service:3001/api/users/profile`

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {jwt-token}
```
→ Proxied to `user-service:3001/api/users/profile`

### Request/Response Flow

1. **Client Request** → API Gateway
2. **Route Analysis** → Determine target service
3. **Service Communication** → Forward request to microservice
4. **Response Processing** → Handle service response
5. **Client Response** → Return processed response

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

### Test Coverage
- **Route Testing**: API endpoint validation
- **Service Communication**: Microservice integration testing
- **Error Handling**: Error response validation
- **Health Checks**: Service monitoring testing

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
npm run dev              # Start with hot reload
npm run dev:debug        # Start with debugger

# Building
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run format           # Prettier formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

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
