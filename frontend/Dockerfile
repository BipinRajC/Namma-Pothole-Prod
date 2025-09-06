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

# Debug: Print environment variables (will show in build logs)
RUN echo "🔍 Build-time environment variables:"
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"
RUN echo "VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY:0:10}..." # Only show first 10 chars for security

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm i

# Copy source code
COPY . .

# Verify environment variables are available to Vite
RUN echo "🔍 Verifying Vite can access environment variables..."
RUN node -e "console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL); console.log('VITE_GOOGLE_MAPS_API_KEY:', process.env.VITE_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');"

# Build the application with environment variables
RUN npm run build

# Verify build output contains the environment variables
RUN echo "🔍 Checking if environment variables were baked into the build..."
RUN if [ -n "$VITE_API_BASE_URL" ]; then \
      echo "Searching for API URL in build files..."; \
      find dist -name "*.js" -type f -exec grep -l "$VITE_API_BASE_URL" {} \; || echo "⚠️  API URL not found in build files"; \
    fi

# Production stage - just the built files
FROM alpine:latest

# Install basic tools for health checks and debugging
RUN apk add --no-cache curl jq

# Create directory for static files
RUN mkdir -p /var/www/html

# Copy built application
COPY --from=build /app/dist /var/www/html

# Add debugging script
RUN cat > /usr/local/bin/debug-env.sh << 'EOF'
#!/bin/sh
echo "🔍 Frontend Environment Variables Debug"
echo "======================================"

# Check if files exist
echo "📁 Checking static files..."
ls -la /var/www/html/

# Search for environment variable usage in JS files
echo ""
echo "🔍 Searching for API base URL in built files..."
find /var/www/html -name "*.js" -type f | head -5 | while read file; do
    echo "Checking: $file"
    if grep -q "import\.meta\.env\.VITE_API_BASE_URL" "$file" 2>/dev/null; then
        echo "  ✅ Found import.meta.env.VITE_API_BASE_URL"
    fi
    if grep -q "localhost:3000" "$file" 2>/dev/null; then
        echo "  ⚠️  Found localhost:3000 (fallback)"
    fi
    if grep -q "nammapothole.com" "$file" 2>/dev/null; then
        echo "  ✅ Found nammapothole.com"
    fi
done

echo ""
echo "🔍 Searching for Google Maps API key..."
find /var/www/html -name "*.js" -type f | head -5 | while read file; do
    if grep -q "your_google_maps_api_key_here" "$file" 2>/dev/null; then
        echo "  ⚠️  Found placeholder API key in $file"
    fi
    if grep -q "import\.meta\.env\.VITE_GOOGLE_MAPS_API_KEY" "$file" 2>/dev/null; then
        echo "  ✅ Found import.meta.env.VITE_GOOGLE_MAPS_API_KEY in $file"
    fi
done

echo ""
echo "✅ Debug complete. Run this inside the container with: docker exec <container> debug-env.sh"
EOF

RUN chmod +x /usr/local/bin/debug-env.sh

# Keep container running (Caddy will serve the files)
CMD ["tail", "-f", "/dev/null"]
