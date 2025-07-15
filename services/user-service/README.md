# User Service

A production-grade microservice for user management in the NeatSpend application.

## Features

- ✅ User registration and authentication
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ Comprehensive logging with @gauravsharmacode/neat-logger
- ✅ Database query logging and monitoring
- ✅ Rate limiting and security headers
- ✅ Health checks and monitoring
- ✅ Graceful shutdown handling
- ✅ Docker containerization
- ✅ Production-ready error handling

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: express-validator
- **Logging**: @gauravsharmacode/neat-logger
- **Security**: Helmet, CORS, Rate Limiting
- **Containerization**: Docker

## Architecture

This service follows a clean architecture pattern:

```
src/
├── config/          # Configuration management
│   ├── index.js     # Main configuration
│   └── database.js  # Database configuration with logging
├── models/          # Data access layer
│   └── UserModel.js # User database operations
├── services/        # Business logic layer
│   └── UserService.js # User business logic
├── controllers/     # HTTP request handlers
│   ├── authController.js # Authentication endpoints
│   └── userController.js # User management endpoints
├── middleware/      # Express middleware
│   ├── auth.js      # Authentication middleware
│   ├── validation.js # Input validation
│   └── errorHandler.js # Error handling
├── routes/          # API routes
│   ├── authRoutes.js # Authentication routes
│   └── userRoutes.js # User management routes
├── utils/           # Utility functions
│   └── auth.js      # Authentication utilities
└── index.js         # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update current user profile
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user (admin only)
- `DELETE /api/v1/users/:id` - Soft delete user (admin only)
- `PATCH /api/v1/users/:id/change-password` - Change user password
- `PATCH /api/v1/users/:id/deactivate` - Deactivate user (admin only)
- `GET /api/v1/users/stats` - Get user statistics (admin only)

### Health Checks
- `GET /` - Service information
- `GET /health` - Health check endpoint

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/neatspend_users?schema=public"

# Server
PORT=3001
NODE_ENV=development
SERVICE_NAME=user-service

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
DB_LOG_QUERIES=true
DB_LOG_SLOW_QUERIES=true
DB_SLOW_QUERY_THRESHOLD=1000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. Start development server:
```bash
npm run dev
```

The service will be available at `http://localhost:3001`

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:seed` - Seed database

## Production Deployment

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t user-service .

# Run container
docker run -p 3001:3001 --env-file .env user-service
```

### Docker Compose

Use the main docker-compose.yml from the project root:

```bash
docker-compose up user-service
```

### Environment-specific Configuration

#### Development
- Detailed logging enabled
- Database query logging enabled
- Error stack traces included in responses

#### Production
- Minimal logging for performance
- Error details hidden from clients
- Health checks enabled
- Graceful shutdown handling

## Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation with express-validator
- **Rate Limiting**: Configurable rate limiting per IP
- **Security Headers**: Helmet.js for security headers
- **Password Security**: bcrypt with configurable rounds
- **CORS**: Configurable CORS settings
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## Monitoring and Observability

### Logging
- Structured JSON logging with @gauravsharmacode/neat-logger
- Request/response logging with duration tracking
- Database query logging with slow query detection
- Error logging with stack traces (development only)

### Health Checks
- `/health` endpoint for container health checks
- Database connectivity checks
- Memory usage monitoring

### Metrics
- Request duration tracking
- Database query performance monitoring
- Error rate tracking

## Error Handling

The service implements comprehensive error handling:

- **Validation Errors**: 400 Bad Request with detailed field errors
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Conflict Errors**: 409 Conflict (duplicate email/phone)
- **Server Errors**: 500 Internal Server Error

## Database Schema

### User Model
```prisma
model User {
  id          String      @id @default(uuid())
  email       String      @unique
  name        String?
  firstName   String?
  lastName    String?
  password    String?
  phone       String?     @unique
  isActive    Boolean     @default(true)
  isVerified  Boolean     @default(false)
  role        String      @default("user")
  lastLoginAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?   // Soft delete

  @@map("users")
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
