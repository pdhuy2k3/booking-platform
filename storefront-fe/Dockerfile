FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and source code
COPY package.json ./
COPY . .

# Use npm for more reliable Docker builds
RUN npm install --legacy-peer-deps
RUN npm run build 

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_BFF_BASE_URL=${NEXT_PUBLIC_BFF_BASE_URL}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory and copy if exists
RUN mkdir -p ./public
# Copy Next.js build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
