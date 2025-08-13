# Build stage
FROM node:22.17.1-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies only when needed
# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/storefront-fe ./apps/storefront-fe
COPY libs ./libs

# Build the application
RUN npx nx build storefront-fe

# Production stage
FROM node:22.17.1-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/storefront-fe/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/storefront-fe/static ./apps/storefront-fe/.next/static

# Copy health check script
COPY apps/storefront-fe/healthcheck.js ./healthcheck.js

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/storefront-fe/server.js"]
