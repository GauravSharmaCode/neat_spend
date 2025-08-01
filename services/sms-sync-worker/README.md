# SMS Sync Worker

A production-ready microservice for synchronizing and managing SMS messages in the NeatSpend application with Firestore integration and JWT authentication.

## ✨ Features

### Core Features

- ✅ SMS message synchronization with Firestore
- ✅ JWT authentication with User Service integration
- ✅ RESTful API for message CRUD operations
- ✅ Bulk and single message sync capabilities
- ✅ User-specific message isolation and security
- ✅ Comprehensive error handling and logging

### Security & Reliability

- ✅ JWT token validation for all endpoints
- ✅ User authorization checks for data access
- ✅ Structured logging with neat-logger
- ✅ Docker containerization with health checks
- ✅ Production-ready error handling

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: Google Cloud Firestore
- **Authentication**: JWT tokens via User Service
- **Logging**: Shared neat-logger utility
- **Testing**: Jest with comprehensive test coverage
- **Containerization**: Docker with Alpine Linux

## 🏗️ Project Structure

```
sms-sync-worker/
├── src/
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth and error handling
│   ├── routes/              # API route definitions
│   ├── services/            # Firestore and User Service clients
│   ├── config/              # Configuration files
│   ├── interfaces.ts        # TypeScript interfaces
│   └── index.ts             # Application entry point
├── tests/                   # Test files
├── Dockerfile              # Multi-stage Docker build
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- Google Cloud Firestore credentials
- User Service running (for authentication)
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
docker-compose up sms-sync-worker

# Or build standalone
docker build -t sms-sync-worker .
docker run -p 4002:4002 sms-sync-worker
```

## 🔧 Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=4002
SERVICE_NAME=sms-sync-worker

# User Service Integration
USER_SERVICE_URL=http://user-service:3001

# Google Cloud Firestore
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Logging
LOG_LEVEL=info
```

## 📋 API Documentation

### Base URL

- Development: `http://localhost:4002`
- Via Gateway: `http://localhost:8080/api/v1/sms-sync`
- Health Check: `GET /health`

### Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <jwt-token>
```

### SMS Sync Endpoints

#### Sync All Messages

```http
POST /full
Content-Type: application/json

{
  "userId": "user-uuid",
  "messages": [
    {
      "id": "msg-1",
      "sender": "BANK",
      "body": "Transaction alert: $50 spent",
      "timestamp": "2025-07-31T10:00:00Z"
    }
  ]
}
```

#### Sync Single Message

```http
POST /message
Content-Type: application/json

{
  "userId": "user-uuid",
  "message": {
    "id": "msg-1",
    "sender": "BANK",
    "body": "Transaction alert: $50 spent",
    "timestamp": "2025-07-31T10:00:00Z"
  }
}
```

#### Get All Messages

```http
GET /messages?userId=user-uuid
```

#### Get Single Message

```http
GET /message/:id?userId=user-uuid
```

#### Update Message

```http
PATCH /message/:id?userId=user-uuid
Content-Type: application/json

{
  "message": {
    "body": "Updated message content"
  }
}
```

#### Delete Message

```http
DELETE /message/:id?userId=user-uuid
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests**: Controller and service function testing
- **Integration Tests**: API endpoint testing with Firestore
- **Authentication Tests**: JWT validation and user authorization
- **Firestore Tests**: Database connection and operations

## 🐳 Docker

### Multi-stage Dockerfile

- **Builder stage**: Installs dependencies and builds TypeScript
- **Production stage**: Minimal Alpine Linux image with runtime dependencies
- **Security**: Non-root user, minimal attack surface
- **Health checks**: Built-in container health monitoring

### Docker Compose Integration

The service integrates with the main `docker-compose.yml` for:

- Firestore credentials mounting
- User Service networking
- Health checks
- Environment configuration

## 📊 Monitoring & Logging

### Health Checks

- **Container Health**: `/health` endpoint with system checks
- **Firestore Health**: Connection verification
- **User Service Health**: Authentication service connectivity
- **Memory Monitoring**: Process memory usage tracking

### Logging Strategy

```javascript
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

logWithMeta("info", "Message synced successfully", {
  service: "sms-sync-worker",
  function: "syncMessage",
  userId: user.id,
  messageId: message.id,
});
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure, stateless authentication via User Service
- **User Isolation**: Users can only access their own messages
- **Request Validation**: Comprehensive input validation
- **Error Handling**: Secure error responses without data leakage

### Data Security

- **Firestore Security**: Google Cloud security best practices
- **Credential Management**: Service account key security
- **Network Security**: Docker network isolation
- **Input Sanitization**: Protection against injection attacks

## 🔄 Integration Points

The SMS Sync Worker integrates with:

- **User Service**: For JWT authentication and user validation
- **Nginx Gateway**: For request routing and load balancing
- **Google Cloud Firestore**: For message storage and retrieval
- **Docker Network**: For service-to-service communication

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run dev:debug        # Start with debugger

# Building
npm run build            # Build TypeScript
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

### Adding New Features

1. **Create route**: Add new route in `src/routes/`
2. **Add controller**: Implement logic in `src/controllers/`
3. **Add service**: Create Firestore operations in `src/services/`
4. **Write tests**: Add comprehensive tests
5. **Update docs**: Document new endpoints

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all linting and tests pass

## 📝 Error Handling

### Error Response Format

```json
{
  "status": "fail",
  "message": "Error description"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Message not found
- `FIRESTORE_ERROR`: Database operation failed

---

**Part of the NeatSpend microservices ecosystem** 🚀
