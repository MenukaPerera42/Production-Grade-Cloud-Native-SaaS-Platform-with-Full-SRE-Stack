# Use a specific, lightweight Node.js Alpine base image
FROM node:20.12.2-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Copy only package files to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (including devDependencies if needed for build steps)
# Using npm ci for deterministic installs based on package-lock.json
RUN npm ci

# Copy the rest of the application code
COPY . .

# ==========================================
# Production Stage
# ==========================================
FROM node:20.12.2-alpine3.19

# Install dumb-init for proper signal handling (SIGTERM/SIGINT)
RUN apk add --no-cache dumb-init

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Set working directory
WORKDIR /app

# Change ownership of the directory to the non-root 'node' user
RUN chown node:node /app

# Switch to the non-root user for security
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy application source code from the builder stage
# Assuming the main source code is in 'src'. Adjust if you have a build directory like 'dist'.
COPY --chown=node:node --from=builder /app/src ./src

# Expose the application port
EXPOSE 3000

# Define a healthcheck to ensure the container is running and responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start the application using dumb-init and node directly (avoids npm wrapper issues with signals)
CMD ["dumb-init", "node", "src/server.js"]
