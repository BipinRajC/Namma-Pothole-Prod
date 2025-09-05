#!/bin/sh

# Replace environment variables in built files
# This allows runtime configuration of the frontend

echo "Starting frontend container..."

# Install curl for health checks
apk add --no-cache curl

# Replace API_BASE_URL in the built JavaScript files
if [ ! -z "$VITE_API_BASE_URL" ]; then
    echo "Configuring API base URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|http://localhost:3000|$VITE_API_BASE_URL|g" {} \;
fi

# Replace Google Maps API key
if [ ! -z "$VITE_GOOGLE_MAPS_API_KEY" ]; then
    echo "Configuring Google Maps API key"
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|your_google_maps_api_key_here|$VITE_GOOGLE_MAPS_API_KEY|g" {} \;
fi

echo "Frontend configuration complete. Starting Nginx..."

# Execute the main command
exec "$@"
