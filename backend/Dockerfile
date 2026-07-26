# Use official Bun image for high-performance EC2 hosting
FROM oven/bun:1.1 as base
WORKDIR /app

# Copy dependency locks
COPY package.json bun.lock ./
RUN bun install --production

# Copy source code
COPY . .

# Expose HTTP port 3000
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start Hono server
CMD ["bun", "run", "src/index.ts"]
