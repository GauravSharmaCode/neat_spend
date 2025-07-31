FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy the rest of the app
COPY . .

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init and openssl for signal handling and Prisma
RUN apk add --no-cache dumb-init openssl

# Create app user and logs directory FIRST
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    mkdir -p /app/logs && \
    chown nextjs:nodejs /app/logs

# Set working directory
WORKDIR /app

# Copy built app from builder with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
# COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Generate Prisma client after copying schema
# RUN npx prisma generate

# Switch to non-root user
USER nextjs

# Expose service port
EXPOSE 4002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

# Start the app
CMD ["dumb-init", "node", "dist/index.js"]