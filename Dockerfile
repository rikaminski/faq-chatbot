# Stage 1: Dependencies + Precompute
FROM oven/bun:1-debian AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and data
COPY src ./src
COPY scripts ./scripts
COPY data/faqs.example.json ./data/faqs.example.json

# Generate embeddings
RUN bun run precompute

# Stage 2: Runtime
FROM gcr.io/distroless/cc-debian12
WORKDIR /app

# Copy Bun binary
COPY --from=oven/bun:1-debian /usr/local/bin/bun /usr/local/bin/bun

# Copy dependencies (production only)
COPY --from=builder /app/node_modules ./node_modules

# Copy app files
COPY package.json ./
COPY src ./src
COPY views ./views
COPY public ./public

# Copy precomputed embeddings
COPY --from=builder /app/data ./data

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/bun", "run", "src/index.ts"]
