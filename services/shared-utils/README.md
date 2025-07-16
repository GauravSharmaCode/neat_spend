# Shared Utils

A collection of shared utilities and helper functions used across all NeatSpend microservices. This package provides common functionality to ensure consistency and reduce code duplication.

## ✨ Features

- ✅ Common utility functions
- ✅ Database connection helpers
- ✅ Shared constants and configurations
- ✅ Error handling utilities
- ✅ Validation helpers
- ✅ Data transformation utilities
- ✅ Environment configuration helpers

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x
- **Dependencies**: Minimal external dependencies
- **Testing**: Jest for unit testing
- **Code Quality**: ESLint for consistent code style

## 🏗️ Project Structure

```
shared-utils/
├── src/
│   ├── constants/           # Shared constants
│   ├── database/           # Database utilities
│   ├── errors/             # Error handling utilities
│   ├── validation/         # Validation helpers
│   ├── transformers/       # Data transformation utilities
│   └── config/             # Configuration helpers
├── tests/                  # Unit tests
├── package.json           # Dependencies and scripts
├── index.js              # Main exports
└── README.md             # This file
```

## 📋 Available Utilities

### Constants
```javascript
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('@neat-spend/shared-utils');

// HTTP Status Codes
HTTP_STATUS.OK              // 200
HTTP_STATUS.CREATED         // 201
HTTP_STATUS.BAD_REQUEST     // 400
HTTP_STATUS.UNAUTHORIZED    // 401
HTTP_STATUS.NOT_FOUND       // 404
HTTP_STATUS.INTERNAL_ERROR  // 500

// Error Codes
ERROR_CODES.VALIDATION_ERROR
ERROR_CODES.USER_NOT_FOUND
ERROR_CODES.INVALID_CREDENTIALS

// User Roles
ROLES.USER
ROLES.ADMIN
```

### Database Utilities
```javascript
const { DatabaseHelper } = require('@neat-spend/shared-utils');

// Connection validation
const isConnected = await DatabaseHelper.validateConnection(databaseUrl);

// Query helpers
const sanitized = DatabaseHelper.sanitizeQuery(query);
const paginated = DatabaseHelper.buildPaginationQuery(page, limit);
```

### Error Handling
```javascript
const { AppError, ErrorHandler } = require('@neat-spend/shared-utils');

// Custom error creation
throw new AppError('User not found', 404, 'USER_NOT_FOUND');

// Error response formatting
const response = ErrorHandler.formatError(error);
```

### Validation Helpers
```javascript
const { Validator } = require('@neat-spend/shared-utils');

// Email validation
const isValid = Validator.isValidEmail('user@example.com');

// Password strength
const strength = Validator.checkPasswordStrength('password123');

// Input sanitization
const sanitized = Validator.sanitizeInput(userInput);
```

### Data Transformers
```javascript
const { Transform } = require('@neat-spend/shared-utils');

// Date formatting
const formatted = Transform.formatDate(new Date(), 'ISO');

// Object sanitization
const cleaned = Transform.removeNullValues(object);

// Response formatting
const response = Transform.formatApiResponse(data, 'success', 'Operation completed');
```

## 🚀 Installation & Usage

### In Workspace Services
```bash
# Install as workspace dependency
npm install @neat-spend/shared-utils --workspace=services/user-service
```

### Import and Use
```javascript
// Import specific utilities
const { HTTP_STATUS, AppError, Validator } = require('@neat-spend/shared-utils');

// Use in your service
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      code: error.code
    });
  }
  
  res.status(HTTP_STATUS.INTERNAL_ERROR).json({
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
- **Unit Tests**: All utility functions
- **Integration Tests**: Database helpers
- **Validation Tests**: Input validation and sanitization
- **Error Handling Tests**: Custom error classes

## 📋 API Reference

### Constants Module

#### HTTP_STATUS
```javascript
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
```

#### ERROR_CODES
```javascript
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};
```

#### ROLES
```javascript
const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'
};
```

### Error Classes

#### AppError
```javascript
class AppError extends Error {
  constructor(message, statusCode, code, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
  }
}
```

### Validation Module

#### Email Validation
```javascript
Validator.isValidEmail(email)
// Returns: boolean
```

#### Password Validation
```javascript
Validator.checkPasswordStrength(password)
// Returns: { score: number, feedback: string[] }
```

#### Input Sanitization
```javascript
Validator.sanitizeInput(input, options = {})
// Returns: sanitized string
```

### Database Module

#### Connection Validation
```javascript
DatabaseHelper.validateConnection(connectionString)
// Returns: Promise<boolean>
```

#### Query Building
```javascript
DatabaseHelper.buildPaginationQuery(page, limit, orderBy)
// Returns: { skip: number, take: number, orderBy: object }
```

### Transform Module

#### Date Formatting
```javascript
Transform.formatDate(date, format = 'ISO')
// Returns: formatted date string
```

#### API Response Formatting
```javascript
Transform.formatApiResponse(data, status = 'success', message = '')
// Returns: standardized response object
```

#### Object Cleaning
```javascript
Transform.removeNullValues(object)
// Returns: object without null/undefined values
```

## 🔧 Configuration

### Environment Helpers
```javascript
const { Config } = require('@neat-spend/shared-utils');

// Get environment variable with default
const port = Config.get('PORT', 3000);

// Get required environment variable
const dbUrl = Config.getRequired('DATABASE_URL');

// Check if in production
const isProd = Config.isProduction();
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
npm run format           # Prettier formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Adding New Utilities

1. **Create Utility File**: Add new utility in appropriate directory
2. **Write Tests**: Add comprehensive unit tests
3. **Export Function**: Add to main index.js exports
4. **Update Documentation**: Document new utility in README
5. **Version Update**: Update package version appropriately

## 📝 Best Practices

### Error Handling
```javascript
// Use AppError for operational errors
throw new AppError('Invalid user ID', 400, 'VALIDATION_ERROR');

// Use standard Error for programming errors
throw new Error('Unexpected condition in code');
```

### Validation
```javascript
// Always validate input data
const email = Validator.sanitizeInput(req.body.email);
if (!Validator.isValidEmail(email)) {
  throw new AppError('Invalid email format', 400, 'VALIDATION_ERROR');
}
```

### Response Formatting
```javascript
// Use consistent response format
const response = Transform.formatApiResponse(
  userData, 
  'success', 
  'User retrieved successfully'
);
res.json(response);
```

## 🔄 Versioning

This package follows semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

## 🤝 Contributing

1. **Follow Conventions**: Use existing patterns and naming conventions
2. **Write Tests**: All new utilities must have tests
3. **Update Exports**: Add new utilities to main index.js
4. **Document Changes**: Update README with new functionality
5. **Test Integration**: Verify with dependent services

## 📚 Usage Examples

### Complete Error Handling Setup
```javascript
const express = require('express');
const { HTTP_STATUS, AppError, ErrorHandler } = require('@neat-spend/shared-utils');

const app = express();

// Custom error middleware
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      ErrorHandler.formatError(error)
    );
  }
  
  // Handle unexpected errors
  const formattedError = ErrorHandler.formatError(
    new AppError('Internal server error', HTTP_STATUS.INTERNAL_ERROR, 'INTERNAL_ERROR')
  );
  
  res.status(HTTP_STATUS.INTERNAL_ERROR).json(formattedError);
});
```

### Validation Chain
```javascript
const { Validator, AppError, HTTP_STATUS } = require('@neat-spend/shared-utils');

function validateUserInput(userData) {
  const { email, password, username } = userData;
  
  // Sanitize inputs
  const cleanEmail = Validator.sanitizeInput(email);
  const cleanUsername = Validator.sanitizeInput(username);
  
  // Validate email
  if (!Validator.isValidEmail(cleanEmail)) {
    throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  
  // Validate password strength
  const passwordCheck = Validator.checkPasswordStrength(password);
  if (passwordCheck.score < 3) {
    throw new AppError('Password too weak', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  
  return { email: cleanEmail, username: cleanUsername, password };
}
```

---

**Part of the NeatSpend microservices ecosystem** 🚀
