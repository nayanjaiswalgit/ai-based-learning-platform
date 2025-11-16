FROM node:22-alpine AS base

RUN npm install -g pnpm@9.14.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/web ./apps/web

# Build Next.js app
WORKDIR /app/apps/web
RUN pnpm build

# Production image
FROM node:22-alpine AS production

RUN npm install -g pnpm@9.14.4

WORKDIR /app

COPY --from=base /app/apps/web/.next ./.next
COPY --from=base /app/apps/web/public ./public
COPY --from=base /app/apps/web/package.json ./
COPY --from=base /app/apps/web/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]
