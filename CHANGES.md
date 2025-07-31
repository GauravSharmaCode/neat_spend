# Project Changes

## API Gateway Refactoring

The NeatSpend API Gateway has been refactored to follow a modular architecture pattern:

- **Modular Structure**: Organized code into core components and routes
- **Improved Maintainability**: Each module has a single responsibility
- **Enhanced Scalability**: New services can be easily added
- **Better Testability**: Components can be tested in isolation

### Key Changes

1. **Directory Structure**:
   - Created a `core` directory for fundamental components
   - Organized into `core/middleware`, `core/services`, and `core/utils`
   - Maintained separate `routes` directory for API endpoints
   - Moved logs directory to root level

2. **Middleware Modules**:
   - Extracted request logging into `core/middleware/logger.ts`
   - Centralized error handling in `core/middleware/error.ts`

3. **Route Modules**:
   - Health routes in `routes/health.ts`
   - API routes in `routes/api.ts`
   - Legacy routes in `routes/legacy.ts`

4. **Service Modules**:
   - Proxy configuration in `core/services/proxy.ts`
   - Reusable service proxy creation

5. **Utility Modules**:
   - Health check utility in `core/utils/health.ts`
   - Graceful shutdown in `core/utils/shutdown.ts`
   - Moved healthcheck script to `core/utils/healthcheck.ts`
   - Updated Dockerfile to reference new healthcheck location

6. **Documentation**:
   - Added `ARCHITECTURE.md` with detailed structure explanation

### Working Endpoints

| Method | Endpoint | Description | Service |
|--------|----------|-------------|----------|
| GET | `/` | Service info with microservice URLs | API Gateway |
| GET | `/health` | Detailed health with uptime/memory | API Gateway |
| POST | `/api/v1/auth/register` | User creation with validation | User Service |
| POST | `/api/v1/auth/login` | JWT token generation | User Service |
| GET | `/api/v1/users` | List users (requires authentication) | User Service |
| GET | `/users` | 410 Gone - Proper deprecation notice | API Gateway |

### Fixed Issues

- Fixed "socket hang up" error when calling `/api/v1/auth/register` through the API gateway
- Improved proxy configuration to properly handle POST requests with JSON bodies
- Added proper content-length handling for proxied requests
- Enhanced error logging with more context for troubleshooting
- Added debug endpoint at `/api/debug` to verify API router functionality
- Fixed issues with body parsing and forwarding in proxy middleware

### Proxy Routes

| Base Path | Target Service | Description |
|-----------|----------------|-------------|
| `/api/v1/auth/*` | User Service | Authentication endpoints |
| `/api/v1/users/*` | User Service | User management endpoints |
| `/api/v1/sms/*` | SMS Service | SMS processing (planned) |
| `/api/v1/insights/*` | Insight Service | Financial insights (planned) |

All tests are passing, confirming the refactoring maintains existing functionality.