# NeatSpend API Gateway Architecture

## Overview

The NeatSpend API Gateway has been refactored to follow a modular architecture pattern. This document outlines the structure and components of the gateway.

## Directory Structure

```
neatspend-api/
├── src/
│   ├── core/               # Core functionality
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Service integrations
│   │   └── utils/          # Utility functions
│   ├── config/             # Configuration settings
│   ├── routes/             # API route handlers
│   ├── types/              # TypeScript type definitions
│   ├── index.ts            # Main application entry point
│   └── interfaces.ts       # TypeScript interfaces
├── tests/                  # Test files
└── ...
```

## Components

### 1. Core Middleware

- **logger.ts**: Request logging middleware
- **error.ts**: Error handling and 404 handling middleware

### 2. Routes

- **health.ts**: Health check and root endpoints
- **api.ts**: API routes that proxy to microservices
- **legacy.ts**: Legacy endpoints with deprecation notices

### 3. Core Services

- **proxy.ts**: Service proxy configuration for microservices

### 4. Core Utils

- **health.ts**: Health check utilities
- **shutdown.ts**: Graceful shutdown handling

## Flow

1. Request comes into the API Gateway
2. Request passes through middleware (security, logging, etc.)
3. Request is routed to the appropriate handler:
   - Health checks → health.ts
   - API requests → api.ts (which proxies to microservices)
   - Legacy endpoints → legacy.ts
4. If no route matches, the 404 handler is triggered
5. Any errors are caught by the global error handler

## Proxy Configuration

The API Gateway proxies requests to the following microservices:

- **User Service**: Handles user authentication and management
- **SMS Service**: Processes SMS notifications (planned)
- **Insight Service**: Provides financial insights (planned)

## Health Checks

The API Gateway includes comprehensive health checks that:

1. Report the gateway's own health status
2. Check the health of all connected microservices
3. Return detailed health information including uptime and memory usage

## Error Handling

The API Gateway implements a centralized error handling strategy:

1. All errors are caught by the global error handler
2. Errors are logged with appropriate context
3. Standardized error responses are returned to clients
4. Development mode includes additional debugging information

## Graceful Shutdown

The API Gateway handles graceful shutdown on SIGTERM and SIGINT signals to ensure:

1. No requests are dropped during deployments
2. Resources are properly released
3. Shutdown events are logged

## Benefits of This Architecture

- **Modularity**: Each component has a single responsibility
- **Maintainability**: Easier to understand and modify
- **Testability**: Components can be tested in isolation
- **Scalability**: New services can be easily added
- **Readability**: Clear separation of concerns