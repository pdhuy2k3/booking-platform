# Multi-stage Dockerfile for Backoffice Nuxt.js application
# Stage 1: Build stage
FROM node:22.17.1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and nx configuration
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy the backoffice app and shared dependencies
COPY apps/backoffice-fe ./apps/backoffice-fe
COPY libs ./libs

# Install dependencies
RUN npm ci --only=production=false

# Build the Nuxt application
RUN npx nx build backoffice-fe

# Stage 2: Production stage
FROM node:22.17.1-alpine AS production

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nuxtjs:nodejs /app/dist/apps/backoffice-fe ./

# Copy health check script
COPY --from=builder --chown=nuxtjs:nodejs /app/apps/backoffice-fe/healthcheck.js ./

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Health check using the Node.js script
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/index.mjs"]