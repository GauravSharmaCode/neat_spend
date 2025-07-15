#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serviceName = process.argv[2];

if (!serviceName) {
  console.error('❌ Please provide a service name');
  console.log('Usage: npm run create-service <service-name>');
  console.log('Example: npm run create-service transaction-service');
  process.exit(1);
}

const serviceDir = path.join(__dirname, '..', 'services', serviceName);

if (fs.existsSync(serviceDir)) {
  console.error(`❌ Service ${serviceName} already exists`);
  process.exit(1);
}

console.log(`🚀 Creating new service: ${serviceName}`);

// Create service directory structure
const dirs = [
  '',
  'src',
  'src/config',
  'src/models',
  'src/services',
  'src/controllers',
  'src/routes',
  'src/middleware',
  'src/utils',
  'prisma',
  'tests'
];

dirs.forEach(dir => {
  const fullPath = path.join(serviceDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`📁 Created directory: ${fullPath}`);
});

// Generate package.json
const packageJson = {
  "name": serviceName,
  "version": "1.0.0",
  "description": `${serviceName} microservice for NeatSpend`,
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "prisma": "prisma",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:migrate:prod": "prisma migrate deploy"
  },
  "dependencies": {
    "@gauravsharmacode/neat-logger": "^1.0.0",
    "@prisma/client": "^5.22.0",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "prisma": "^5.22.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.57.0"
  },
  "keywords": ["microservice", serviceName.split('-')[0], "nodejs"],
  "author": "NeatSpend Team",
  "license": "MIT"
};

fs.writeFileSync(
  path.join(serviceDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Generate basic Dockerfile
const dockerfile = `FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

RUN npx prisma generate

EXPOSE 3000

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

CMD ["dumb-init", "node", "src/index.js"]
`;

fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerfile);

// Generate basic index.js
const indexJs = `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { logWithMeta } = require('@gauravsharmacode/neat-logger');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logWithMeta('HTTP Request', {
      func: 'requestLogger',
      level: 'info',
      extra: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  });

  next();
});

// Health check endpoints
app.get('/', (req, res) => {
  logWithMeta('Root endpoint hit', { func: '/', level: 'info' });
  res.status(200).json({
    status: 'success',
    message: '${serviceName} is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  logWithMeta('Health check endpoint hit', { func: '/health', level: 'info' });
  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
    service: '${serviceName}',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// TODO: Add your API routes here
// app.use('/api/v1/your-routes', yourRoutes);

// Handle undefined routes
app.all('*', (req, res) => {
  logWithMeta(\`Route not found: \${req.method} \${req.originalUrl}\`, {
    func: 'routeNotFound',
    level: 'warn',
    extra: {
      method: req.method,
      url: req.originalUrl
    }
  });
  res.status(404).json({
    status: 'fail',
    message: \`Can't find \${req.originalUrl} on this server!\`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logWithMeta('Unhandled error', { 
    func: 'globalErrorHandler',
    level: 'error',
    extra: { 
      error: err.message, 
      stack: err.stack 
    }
  });
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logWithMeta(\`\${signal} received, shutting down gracefully\`, {
    func: 'gracefulShutdown',
    level: 'info',
    extra: { signal }
  });
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logWithMeta(\`\${serviceName} listening on port \${PORT}\`, { 
    func: 'startServer',
    level: 'info',
    extra: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

module.exports = app;
`;

fs.writeFileSync(path.join(serviceDir, 'src', 'index.js'), indexJs);

// Generate .env.example
const envExample = `# Server
PORT=3000
NODE_ENV=development
SERVICE_NAME=${serviceName}

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/${serviceName.replace('-', '_')}_db?schema=public"

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
DB_LOG_QUERIES=true
DB_LOG_SLOW_QUERIES=true
DB_SLOW_QUERY_THRESHOLD=1000

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

fs.writeFileSync(path.join(serviceDir, '.env.example'), envExample);

// Generate basic README
const readme = `# ${serviceName}

A microservice for NeatSpend application.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

- \`GET /\` - Service information
- \`GET /health\` - Health check

## Development

- \`npm run dev\` - Start development server
- \`npm test\` - Run tests
- \`npm run lint\` - Run linting
`;

fs.writeFileSync(path.join(serviceDir, 'README.md'), readme);

// Generate basic Prisma schema
const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// TODO: Add your data models here
// model Example {
//   id        String   @id @default(uuid())
//   name      String
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//
//   @@map("examples")
// }
`;

fs.writeFileSync(path.join(serviceDir, 'prisma', 'schema.prisma'), prismaSchema);

console.log(`✅ Service ${serviceName} created successfully!`);
console.log('');
console.log('Next steps:');
console.log(`1. cd services/${serviceName}`);
console.log('2. npm install');
console.log('3. Edit .env file with your configuration');
console.log('4. Add your data models to prisma/schema.prisma');
console.log('5. Run: npm run prisma:migrate');
console.log('6. Start developing your service!');
console.log('');
console.log(`🚀 Your service will be available at: http://localhost:3000`);
