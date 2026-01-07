# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM oven/bun:1-debian AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install production dependencies and remove unused packages
RUN bun install --frozen-lockfile --production && \
    rm -rf node_modules/onnxruntime-web && \
    rm -rf node_modules/typescript && \
    rm -rf node_modules/@types && \
    rm -rf node_modules/bun-types && \
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.ts" -not -name "*.d.ts" -delete && \
    find node_modules -name "LICENSE*" -delete && \
    find node_modules -name "CHANGELOG*" -delete

# =============================================================================
# Stage 2: Runtime (distroless with glibc)
# =============================================================================
FROM gcr.io/distroless/cc-debian12 AS runtime

WORKDIR /app

# Copy Bun binary from official image
COPY --from=oven/bun:1-debian /usr/local/bin/bun /usr/local/bin/bun

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY package.json ./
COPY src ./src
COPY views ./views
COPY public ./public
COPY data ./data

# Expose port
EXPOSE 3000

# Run application (distroless uses array syntax)
ENTRYPOINT ["/usr/local/bin/bun", "run", "src/index.ts"]
