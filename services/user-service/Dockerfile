FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm install instead of npm ci
# since package-lock.json might not exist in workspace setups
RUN npm install --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Install dumb-init and openssl for proper signal handling and Prisma compatibility
RUN apk add --no-cache dumb-init openssl

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nextjs:nodejs . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["dumb-init", "node", "src/index.js"]
