# Base stage
FROM node:20.18.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/notification-service/package.json ./services/notification-service/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/notification-service/node_modules ./services/notification-service/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
EXPOSE 4003
CMD ["pnpm", "--filter", "@learning-platform/notification-service", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/notification-service/node_modules ./services/notification-service/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN pnpm --filter @learning-platform/notification-service build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/notification-service/node_modules ./services/notification-service/node_modules
COPY --from=builder /app/services/notification-service/dist ./services/notification-service/dist
COPY services/notification-service/package.json ./services/notification-service/
EXPOSE 4003
USER node
CMD ["node", "services/notification-service/dist/main.js"]
