# Base stage
FROM node:20.18.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/api/package.json ./services/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/api/node_modules ./services/api/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "@learning-platform/api", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/api/node_modules ./services/api/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN pnpm --filter @learning-platform/api build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/api/node_modules ./services/api/node_modules
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY services/api/package.json ./services/api/
EXPOSE 4000
USER node
CMD ["node", "services/api/dist/main.js"]
