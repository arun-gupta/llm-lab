FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 grpcuser

# Copy application files
COPY --from=builder --chown=grpcuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=grpcuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=grpcuser:nodejs /app/server.js ./server.js
COPY --from=builder --chown=grpcuser:nodejs /app/proto ./proto

USER grpcuser

EXPOSE 50051

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const grpc = require('@grpc/grpc-js'); const client = new grpc.Client('localhost:50051', grpc.credentials.createInsecure()); client.waitForReady(Date.now() + 5000, (err) => { process.exit(err ? 1 : 0); });" || exit 1

CMD ["node", "server.js"]
