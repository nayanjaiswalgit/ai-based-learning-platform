# Base stage
FROM node:20.18.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "@learning-platform/web", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @learning-platform/web build

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
