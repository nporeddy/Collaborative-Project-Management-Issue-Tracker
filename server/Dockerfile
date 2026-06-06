# syntax=docker/dockerfile:1.7

# ---------- STAGE 1: Builder ----------
# Compile TypeScript and generate Prisma client
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — this layer caches when only source changes
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema before source — schema changes less often than code
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy TypeScript config
COPY tsconfig.json ./

# Now copy source
COPY src ./src

# Generate Prisma client — fake DATABASE_URL only for the generate step (doesn't connect)
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

# Compile TypeScript -> JavaScript
RUN npm run build

# ---------- STAGE 2: Production ----------
# Minimal runtime image — no source, no dev deps, no build tools
FROM node:20-alpine AS production

WORKDIR /app

# Run as non-root for security
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copy package files and install ONLY production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma client — production code in dist/ expects it at dist/generated/
COPY --from=builder /app/dist/generated ./dist/generated

# Copy prisma schema (needed at runtime for migrations)
COPY --from=builder /app/prisma ./prisma

# Copy prisma config (needed for migrate deploy in Prisma 7)
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Document the port (doesn't actually publish it)
EXPOSE 4000

# Start command — adjust if your entry point differs
CMD ["node", "dist/index.js"]