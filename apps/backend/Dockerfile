# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for all workspaces (for dependency resolution)
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package first, then backend
RUN pnpm --filter @tava-ai/shared build
RUN pnpm --filter backend build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm for production install
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only (ignore-scripts to skip husky prepare)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Set working directory to backend app
WORKDIR /app/apps/backend

# Expose port (App Runner uses 8080 by default)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the server
CMD ["node", "dist/index.js"]
