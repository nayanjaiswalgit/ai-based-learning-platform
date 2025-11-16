# Multi-stage Dockerfile for Terminal Service

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create directories
RUN mkdir -p /app/recordings /app/logs

# Expose port
EXPOSE 3007

# Start application
CMD ["node", "dist/main.js"]
