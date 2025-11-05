# Dockerfile for Render Direct Deploy
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose port (Render assigns PORT env var)
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
