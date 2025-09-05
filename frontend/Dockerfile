# Frontend Dockerfile
# Build React app and output static files for Caddy to serve

FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm i

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - just the built files
FROM alpine:latest

# Install basic tools for health checks (optional)
RUN apk add --no-cache curl

# Create directory for static files
RUN mkdir -p /var/www/html

# Copy built application
COPY --from=build /app/dist /var/www/html

# Keep container running (Caddy will serve the files)
CMD ["tail", "-f", "/dev/null"]
