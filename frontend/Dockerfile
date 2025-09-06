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

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files to Caddy's default directory
COPY --from=build /app/dist /usr/share/caddy

# Create Caddyfile for serving static files
RUN cat > /etc/caddy/Caddyfile << 'EOF'
:80 {
    root * /usr/share/caddy
    file_server
    try_files {path} /index.html
}
EOF

# Health check - test if Caddy is actually serving content
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80