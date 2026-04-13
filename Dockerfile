# ─── Stage 1: Build (compile native modules) ───────────────────────────────
FROM node:20-alpine AS builder

# better-sqlite3 needs python3 + build tools for node-gyp
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Runtime (lean image) ─────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy compiled node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source
COPY src ./src
COPY deploy.js .
COPY package.json .

# Data directory for the SQLite database (mount as volume)
RUN mkdir -p /data

ENV DATABASE_PATH=/data/database.sqlite
ENV NODE_ENV=production

# Token and other secrets are passed at runtime via environment variables,
# never baked into the image
CMD ["node", "src/index.js"]
