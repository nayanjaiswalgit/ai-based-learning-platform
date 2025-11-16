FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.14.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/
COPY services/auth-service/package.json ./services/auth-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database ./packages/database
COPY services/auth-service ./services/auth-service

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm db:generate

# Build auth service
WORKDIR /app/services/auth-service
RUN pnpm build

# Production image
FROM node:22-alpine AS production

RUN npm install -g pnpm@9.14.4

WORKDIR /app

COPY --from=base /app/services/auth-service/dist ./dist
COPY --from=base /app/services/auth-service/package.json ./
COPY --from=base /app/services/auth-service/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
