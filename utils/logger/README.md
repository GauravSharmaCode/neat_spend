# @neat-spend/logger

A production-grade logging utility providing consistent, structured, and leveled logging across all NeatSpend microservices. Designed for observability, debugging, and monitoring in distributed systems.

## ✨ Features

- ✅ Structured JSON logging for easy parsing
- ✅ Multiple log levels (error, warn, info, debug)
- ✅ Service-specific log formatting
- ✅ Request/response tracking
- ✅ Performance monitoring
- ✅ Environment-based configuration
- ✅ Production and development modes
- ✅ Zero external dependencies
- ✅ Memory efficient

## 🚀 Installation

### In Workspace (Recommended)
```bash
# Install as workspace dependency
npm install @neat-spend/logger --workspace=services/user-service
```

### Standalone
```bash
npm install @neat-spend/logger
```

## 📋 Basic Usage

### Simple Logging
```javascript
const logger = require('@neat-spend/logger');

// Basic log levels
logger.info('Service started successfully');
logger.warn('Low memory warning');
logger.error('Database connection failed');
logger.debug('Debug information');
```

### Structured Logging with Context
```javascript
const logger = require('@neat-spend/logger');

// Log with structured metadata
logger.info('User created successfully', {
  service: 'user-service',
  function: 'createUser',
  userId: 'uuid-123',
  email: 'user@example.com',
  duration: 150
});
```

### Request Logging
```javascript
const logger = require('@neat-spend/logger');

// HTTP request logging
logger.info('HTTP Request', {
  service: 'api-gateway',
  method: 'POST',
  url: '/api/users/register',
  statusCode: 201,
  responseTime: 245,
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.100'
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Log level configuration
LOG_LEVEL=info              # error, warn, info, debug
NODE_ENV=development        # affects log formatting

# Service identification
SERVICE_NAME=user-service   # automatically added to logs
```

### Log Levels
- **error**: System errors, exceptions, failures
- **warn**: Warning conditions, deprecated usage
- **info**: General information, service events
- **debug**: Detailed debugging information

## 📊 Output Formats

### Development Mode
```bash
[2025-07-16T08:00:00.123Z] INFO [user-service]: User created successfully
  service: user-service
  function: createUser
  userId: uuid-123
  email: user@example.com
  duration: 150ms
```

### Production Mode (JSON)
```json
{
  "timestamp": "2025-07-16T08:00:00.123Z",
  "level": "info",
  "service": "user-service",
  "message": "User created successfully",
  "function": "createUser",
  "userId": "uuid-123",
  "email": "user@example.com",
  "duration": 150,
  "pid": 1234,
  "hostname": "container-id"
}
```

## 🛠️ Advanced Usage

### Error Logging with Stack Traces
```javascript
const logger = require('@neat-spend/logger');

try {
  // Some operation
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    service: 'user-service',
    function: 'riskyOperation',
    error: error.message,
    stack: error.stack,
    userId: req.user?.id
  });
}
```

### Performance Monitoring
```javascript
const logger = require('@neat-spend/logger');

const startTime = Date.now();

// Your operation here
await performDatabaseQuery();

const duration = Date.now() - startTime;

logger.info('Database query completed', {
  service: 'user-service',
  function: 'performDatabaseQuery',
  duration,
  query: 'SELECT * FROM users WHERE id = ?',
  performance: duration > 1000 ? 'slow' : 'normal'
});
```

### Conditional Logging
```javascript
const logger = require('@neat-spend/logger');

// Only log in development
if (process.env.NODE_ENV === 'development') {
  logger.debug('Development debug info', {
    service: 'user-service',
    debugData: complexObject
  });
}

// Log different levels based on conditions
const logLevel = error.isOperational ? 'warn' : 'error';
logger[logLevel]('Operational issue detected', {
  service: 'user-service',
  error: error.message,
  isOperational: error.isOperational
});
```

## 🔍 Express.js Integration

### Request Logging Middleware
```javascript
const express = require('express');
const logger = require('@neat-spend/logger');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('HTTP Request', {
      service: process.env.SERVICE_NAME,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    });
  });
  
  next();
});
```

### Error Logging Middleware
```javascript
// Error logging middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    service: process.env.SERVICE_NAME,
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    requestId: req.id
  });
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});
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

### Test Coverage
- **Unit Tests**: Logger function testing
- **Format Tests**: Output format validation
- **Performance Tests**: Memory and speed benchmarks
- **Integration Tests**: Express.js middleware testing

## 📋 API Reference

### Main Logger Object

#### logger.info(message, metadata)
```javascript
logger.info('Information message', {
  service: 'service-name',
  key: 'value'
});
```

#### logger.warn(message, metadata)
```javascript
logger.warn('Warning message', {
  service: 'service-name',
  warning: 'details'
});
```

#### logger.error(message, metadata)
```javascript
logger.error('Error message', {
  service: 'service-name',
  error: 'error details',
  stack: 'stack trace'
});
```

#### logger.debug(message, metadata)
```javascript
logger.debug('Debug message', {
  service: 'service-name',
  debugData: 'detailed info'
});
```

### Utility Functions

#### logger.setLevel(level)
```javascript
// Programmatically set log level
logger.setLevel('debug');
```

#### logger.isLevelEnabled(level)
```javascript
// Check if log level is enabled
if (logger.isLevelEnabled('debug')) {
  logger.debug('This will only run if debug is enabled');
}
```

## 🔧 Configuration Options

### Logger Configuration
```javascript
const logger = require('@neat-spend/logger');

// Configure logger (optional)
logger.configure({
  level: 'info',
  service: 'my-service',
  format: 'json', // 'json' or 'pretty'
  timestamp: true,
  colorize: false
});
```

### Environment-based Configuration
```javascript
// Automatic configuration based on NODE_ENV
// Development: Pretty format with colors
// Production: JSON format for log aggregation
// Test: Minimal logging
```

## 🚀 Performance Features

### Memory Efficiency
- **Minimal Allocations**: Efficient object creation
- **No External Dependencies**: Zero dependency overhead
- **Stream-based**: Non-blocking log output

### Speed Optimizations
- **Level Checking**: Skip expensive operations for disabled levels
- **Lazy Evaluation**: Compute metadata only when needed
- **Buffered Output**: Efficient console output

## 🔄 Integration Patterns

### Service Initialization
```javascript
const express = require('express');
const logger = require('@neat-spend/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('Service started', {
    service: process.env.SERVICE_NAME,
    port: PORT,
    environment: process.env.NODE_ENV,
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
});
```

### Database Operations
```javascript
const logger = require('@neat-spend/logger');

async function createUser(userData) {
  logger.info('Creating user', {
    service: 'user-service',
    function: 'createUser',
    email: userData.email
  });
  
  try {
    const user = await database.user.create(userData);
    
    logger.info('User created successfully', {
      service: 'user-service',
      function: 'createUser',
      userId: user.id,
      email: user.email
    });
    
    return user;
  } catch (error) {
    logger.error('User creation failed', {
      service: 'user-service',
      function: 'createUser',
      error: error.message,
      email: userData.email
    });
    
    throw error;
  }
}
```

## 📊 Monitoring & Observability

### Log Aggregation
The JSON format is designed for log aggregation systems:
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Fluentd**: Log collection and forwarding
- **CloudWatch**: AWS log monitoring
- **Datadog**: Application performance monitoring

### Structured Queries
```bash
# Find all errors for specific service
jq '.level == "error" and .service == "user-service"' logs.json

# Find slow operations
jq '.duration > 1000' logs.json

# Count log levels
jq '.level' logs.json | sort | uniq -c
```

## 🔒 Security Considerations

### Sensitive Data
```javascript
const logger = require('@neat-spend/logger');

// DON'T log sensitive data
logger.info('User login', {
  service: 'user-service',
  password: 'sensitive-data' // ❌ Never do this
});

// DO sanitize sensitive data
logger.info('User login', {
  service: 'user-service',
  email: user.email,
  userId: user.id
  // password omitted ✅
});
```

### Data Sanitization
```javascript
function sanitizeForLogging(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

logger.info('User data', sanitizeForLogging(userData));
```

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start with watch mode

# Building
npm run build            # Build for production

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Benchmarks
npm run benchmark        # Performance benchmarks
```

## 📚 Best Practices

### Message Writing
```javascript
// Good: Clear, actionable messages
logger.info('User authentication successful', { userId: 'uuid' });
logger.error('Database connection failed', { connectionString: 'postgres://...' });

// Bad: Vague or unhelpful messages
logger.info('Something happened');
logger.error('Error');
```

### Metadata Structure
```javascript
// Good: Consistent metadata structure
logger.info('User action', {
  service: 'user-service',
  function: 'updateProfile',
  userId: 'uuid',
  action: 'profile_update',
  changes: ['email', 'firstName']
});

// Bad: Inconsistent or unstructured metadata
logger.info('User did something', { 
  random: 'data',
  mixed: { nested: 'object' }
});
```

### Performance Considerations
```javascript
// Good: Check log level before expensive operations
if (logger.isLevelEnabled('debug')) {
  logger.debug('Complex debug info', {
    service: 'user-service',
    complexData: JSON.stringify(largeObject)
  });
}

// Bad: Always computing expensive data
logger.debug('Complex debug info', {
  service: 'user-service',
  complexData: JSON.stringify(largeObject) // Always computed
});
```

---

**Part of the NeatSpend microservices ecosystem** 🚀
