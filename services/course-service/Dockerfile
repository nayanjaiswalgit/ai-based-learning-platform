# Multi-stage build for production
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.14.4

# Stage 1: Dependencies
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY services/course-service/package.json ./services/course-service/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS build
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/course-service/node_modules ./services/course-service/node_modules
COPY --from=dependencies /app/packages/database/node_modules ./packages/database/node_modules

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/packages/database
RUN pnpm exec prisma generate

# Build the application
WORKDIR /app/services/course-service
RUN pnpm run build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.14.4

# Copy package files
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/services/course-service/package.json ./services/course-service/
COPY --from=build /app/packages/database/package.json ./packages/database/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application and Prisma
COPY --from=build /app/services/course-service/dist ./services/course-service/dist
COPY --from=build /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=build /app/packages/database/prisma ./packages/database/prisma

# Set working directory
WORKDIR /app/services/course-service

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:4001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
