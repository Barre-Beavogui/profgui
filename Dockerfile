# Build stage
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --include=dev --no-fund --no-audit

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json package-lock.json ./
RUN npm install --include=dev --no-fund --no-audit
COPY drizzle.config.ts tsconfig.json ./
COPY shared ./shared
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["sh", "-c", "npm run db:push && node dist/index.cjs"]
