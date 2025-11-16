# Base stage
FROM node:20.18.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/ai-service/package.json ./services/ai-service/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/ai-service/node_modules ./services/ai-service/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
EXPOSE 4002
CMD ["pnpm", "--filter", "@learning-platform/ai-service", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/ai-service/node_modules ./services/ai-service/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN pnpm --filter @learning-platform/ai-service build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/ai-service/node_modules ./services/ai-service/node_modules
COPY --from=builder /app/services/ai-service/dist ./services/ai-service/dist
COPY services/ai-service/package.json ./services/ai-service/
EXPOSE 4002
USER node
CMD ["node", "services/ai-service/dist/main.js"]
