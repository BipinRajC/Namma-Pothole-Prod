# Frontend Dockerfile
# Build React app and output static files for Caddy to serve

FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY

# Set environment variables for Vite build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm i

# Copy source code
COPY . .

# Build the application with environment variables
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
