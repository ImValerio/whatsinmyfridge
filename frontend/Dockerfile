# Install dependencies only when needed
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Limit memory usage for Next.js build to fit in Raspberry Pi 3 RAM (1GB)
ENV NODE_OPTIONS="--max-old-space-size=768"

RUN npm run build

# Production image, copy all the files and run nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage (the "out" directory from Next.js export)
COPY --from=builder /app/out ./

# Copy custom nginx configuration for frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
