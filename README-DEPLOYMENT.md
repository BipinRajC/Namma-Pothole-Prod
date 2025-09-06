# Namma Pothole - Production Deployment Guide

This guide will help you deploy the Namma Pothole application to your EC2 server with the domain `nammapothole.com`.

## Prerequisites

### On Your EC2 Server
- Docker and Docker Compose installed
- Port 80 and 443 open in security groups
- Domain `nammapothole.com` pointing to your server's IP address

### Required API Keys
- Twilio Account SID and Auth Token (for WhatsApp)
- AWS S3 credentials (for image storage)
- Google Maps API key (for the map functionality)

## Quick Deployment

### 1. Clone and Setup
```bash
# Clone your repository to EC2
git clone <your-repo-url>
cd Namma-Pothole

# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 2. Configure Environment Variables
Edit `.env` file with your actual credentials:

```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/namma_pothole?retryWrites=true&w=majority

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token

# AWS S3 Configuration
AWS_ACCESS_KEY=your_actual_aws_access_key
AWS_SECRET_KEY=your_actual_aws_secret_key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_S3_BUCKET_REGION=ap-south-1

# Frontend Configuration  
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
VITE_API_BASE_URL=https://nammapothole.com/api
```

### 3. Deploy
```bash
# Run the deployment script
./deploy.sh
```

That's it! The script will:
- Build Docker images for frontend and backend
- Start all services (Frontend, Backend, Redis, MongoDB, Caddy)
- Configure HTTPS automatically via Let's Encrypt
- Perform health checks

## Architecture Overview

```
Internet → Caddy (HTTPS/SSL) → Frontend (Nginx) + Backend (Node.js)
                              ↓                    ↓
                           Redis              MongoDB Atlas
                          (Local)              (Remote)
```

## Services Explanation

### Frontend (React + Nginx)
- **Port**: 80 (internal)
- **Serves**: React dashboard application
- **Features**: Production build, Gzip compression, health checks

### Backend (Node.js + Express)
- **Port**: 3000 (internal)
- **Features**: WhatsApp bot, API endpoints, image processing
- **Dependencies**: Redis for sessions, MongoDB Atlas for data

### Caddy (Reverse Proxy + HTTPS)
- **Ports**: 80, 443 (external)
- **Features**: Automatic HTTPS, reverse proxy, security headers
- **Routes**: 
  - `/` → Frontend
  - `/api/*` → Backend

### Redis
- **Purpose**: Session management for WhatsApp conversations
- **Port**: 6379 (internal)

### MongoDB Atlas
- **Purpose**: Complaint data storage (remote cloud database)
- **Connection**: Via internet using connection string

## Configuration Details

### Domain Configuration
The Caddyfile is configured for `nammapothole.com` and will:
- Automatically get SSL certificates from Let's Encrypt
- Redirect www to non-www
- Serve the frontend at the root
- Proxy API calls to `/api/*` to the backend

### Environment Variables
- Frontend environment variables (`VITE_*`) are baked into static files during Docker build
- Backend connects to local Redis via Docker network and remote MongoDB Atlas  
- Local services communicate via internal Docker network
- Frontend variables are visible to users (client-side) - never put secrets in `VITE_*` variables

## Monitoring & Maintenance

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Everything
```bash
docker-compose down
```

## Important Post-Deployment Steps

### 1. Configure Twilio Webhook
In your Twilio Console, set the webhook URL to:
```
https://nammapothole.com/api/whatsapp
```

### 2. Test the Application
- Visit: `https://nammapothole.com`
- Check WhatsApp bot by sending "Hi" to your Twilio number
- Verify complaints appear on the dashboard

### 3. Monitor Resources
```bash
# Check Docker resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

## Troubleshooting

### Common Issues

#### 1. Frontend Environment Variables Not Working
```bash
# Debug environment variables
docker exec namma-pothole-frontend debug-env.sh

# Rebuild frontend with new variables
docker-compose build --no-cache frontend
docker-compose up -d

# Check build logs for environment variable debug output
docker-compose logs frontend | grep "🔍"
```

**See [DEBUG-ENVIRONMENT-VARIABLES.md](./DEBUG-ENVIRONMENT-VARIABLES.md) for detailed debugging guide.**

#### 2. Services Not Starting
```bash
# Check logs
docker-compose logs service-name

# Common solutions
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 3. Domain Not Resolving
- Verify DNS A record points to your EC2 IP
- Check security groups allow ports 80 and 443
- Wait for DNS propagation (up to 24 hours)

#### 4. SSL Certificate Issues
```bash
# Check Caddy logs
docker-compose logs caddy

# Caddy automatically retries Let's Encrypt
# Ensure port 80 is accessible for ACME challenge
```

#### 5. Database Connection Issues
```bash
# Check if MongoDB is running
docker-compose logs mongodb

# Check Redis
docker-compose logs redis

# Backend should automatically reconnect
```

## Security Features

### Implemented Security
- HTTPS only (automatic redirects)
- Security headers (HSTS, CSP, etc.)
- Non-root Docker containers
- Internal Docker network isolation
- No exposed database ports

### Recommended Additional Security
- Regular security updates
- Firewall configuration (only ports 22, 80, 443)
- Regular backups of MongoDB data
- Log monitoring and alerts

## Backup Strategy

### Database Backup
```bash
# MongoDB backup
docker exec namma-pothole-mongodb mongodump --out /backup

# Copy backup from container
docker cp namma-pothole-mongodb:/backup ./mongodb-backup
```

### Application Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
./deploy.sh
```

This deployment setup follows Docker best practices and provides a robust, production-ready environment for the Namma Pothole application.
