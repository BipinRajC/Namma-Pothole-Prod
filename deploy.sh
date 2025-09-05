#!/bin/bash

# Namma Pothole Production Deployment Script
# Simple and robust deployment using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting Namma Pothole deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📋 Please copy env.example to .env and fill in your credentials:"
    echo "   cp env.example .env"
    echo "   nano .env"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "📋 Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found!"
    echo "📋 Please install docker-compose and try again."
    exit 1
fi

echo "🔍 Checking environment variables..."
source .env

# Validate required environment variables
required_vars=("MONGODB_URI" "TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN" "AWS_ACCESS_KEY" "AWS_SECRET_KEY" "AWS_S3_BUCKET" "GOOGLE_MAPS_API_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose build --no-cache

# Start services
echo "🐳 Starting all services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

services=("namma-pothole-redis" "namma-pothole-backend" "namma-pothole-frontend" "namma-pothole-caddy")

for service in "${services[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q $service; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
        echo "📋 Check logs: docker logs $service"
        exit 1
    fi
done

# Final health check
echo "🌐 Performing final health checks..."

# Check backend health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed - but continuing..."
fi

# Check frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "⚠️  Frontend health check failed - but continuing..."
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Your application is now running at:"
echo "   🌐 Website: https://nammapothole.com"
echo "   🔧 Backend API: https://nammapothole.com/api"
echo ""
echo "📊 Monitor your deployment:"
echo "   docker-compose logs -f                    # View all logs"
echo "   docker-compose ps                         # Check service status"
echo "   docker stats                             # Monitor resource usage"
echo ""
echo "🛠️  Useful commands:"
echo "   docker-compose restart backend           # Restart backend only"
echo "   docker-compose down                      # Stop all services"
echo "   docker-compose up -d                     # Start all services"
echo ""
echo "🔒 Don't forget to:"
echo "   1. Point your domain DNS to this server's IP"
echo "   2. Configure your Twilio webhook to: https://nammapothole.com/api/whatsapp"
echo "   3. Monitor logs for any issues"
echo ""
