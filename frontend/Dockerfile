# 1. Use BUILDPLATFORM so this runs natively (and fast) on your host machine
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fixed the warning: Changed "ENV key value" to "ENV key=value"
ENV NEXT_TELEMETRY_DISABLED=1

# Limit memory usage for Next.js build to fit in Raspberry Pi 3 RAM (1GB)
ENV NODE_OPTIONS="--max-old-space-size=768"

RUN npm run build

# It will automatically use the --platform=linux/arm64 flag you pass in your CLI command.
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy static assets from builder stage (the "out" directory from Next.js export)
COPY --from=builder /app/out ./

# Copy custom nginx configuration for frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]