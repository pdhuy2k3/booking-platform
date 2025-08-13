# syntax=docker/dockerfile:1.7-labs

########################
# Deps
########################
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9 --activate

# root files needed for install & Nx
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nx.json tsconfig.base.json eslint.config.mjs ./
# workspace package manifest for backoffice-fe (ensures deps like lucide-react install)
COPY apps/backoffice-fe/package.json apps/backoffice-fe/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

########################
# Builder (build only backoffice-fe)
########################
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nx.json tsconfig.base.json eslint.config.mjs ./
COPY apps/backoffice-fe ./apps/backoffice-fe
COPY libs ./libs

ENV CI=1
ENV NX_DAEMON=false
ENV NEXT_TELEMETRY_DISABLED=1

# 👇 build just this app (NOT run-many --all)
RUN --mount=type=cache,target=/app/.nx/cache \
    --mount=type=cache,target=/app/node_modules/.cache/nx \
    pnpm exec nx build backoffice-fe --verbose

########################
# Runner (runtime-only)
########################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init libc6-compat
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# 1) standalone server (+ runtime node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/backoffice-fe/.next/standalone ./

# 2) FULL .next (BUILD_ID + manifests + static)
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/backoffice-fe/.next /app/.next

# 3) public assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/backoffice-fe/public ./apps/backoffice-fe/public

# 4) symlinks so any lookup path resolves
RUN mkdir -p /app/apps/backoffice-fe \
 && ln -s /app/.next /app/apps/backoffice-fe/.next \
 && mkdir -p /app/dist/apps/backoffice-fe \
 && ln -s /app/.next /app/dist/apps/backoffice-fe/.next

USER nextjs
EXPOSE 3001
ENTRYPOINT ["dumb-init","--"]
CMD ["node","apps/backoffice-fe/server.js"]
