# Base stage
FROM node:20.18.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
RUN apk add --no-cache docker-cli
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY services/code-runner/package.json ./services/code-runner/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/code-runner/node_modules ./services/code-runner/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
EXPOSE 4001
CMD ["pnpm", "--filter", "@learning-platform/code-runner", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/code-runner/node_modules ./services/code-runner/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN pnpm --filter @learning-platform/code-runner build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/code-runner/node_modules ./services/code-runner/node_modules
COPY --from=builder /app/services/code-runner/dist ./services/code-runner/dist
COPY services/code-runner/package.json ./services/code-runner/
EXPOSE 4001
USER node
CMD ["node", "services/code-runner/dist/main.js"]
