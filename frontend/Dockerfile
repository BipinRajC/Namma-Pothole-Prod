# Frontend Dockerfile - caddy serving static files
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY

# Set environment variables for Vite build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Debug: Print environment variables
RUN echo "🔍 Build-time environment variables:"
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"
RUN echo "VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY:0:10}..."

# Copy package files and install dependencies
COPY package*.json ./
RUN npm i

# Copy source code and build
COPY . .
RUN npm run build

# Verify build contains environment variables
RUN echo "🔍 Checking build output..."
RUN if [ -n "$VITE_API_BASE_URL" ]; then \
      find dist -name "*.js" -exec grep -l "$VITE_API_BASE_URL" {} \; | head -1 || echo "⚠️ API URL not found"; \
    fi

# Production stage - Caddy
FROM caddy:2-alpine

# Copy built files to Caddy's default directory
COPY --from=build /app/dist /usr/share/caddy

# Simple Caddyfile for serving static files
RUN echo ":80 { root * /usr/share/caddy; file_server; try_files {path} /index.html }" > /etc/caddy/Caddyfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD caddy validate --config /etc/caddy/Caddyfile || exit 1

EXPOSE 80