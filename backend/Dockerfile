# Backend Dockerfile
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory with non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm i 

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
               const options = { hostname: 'localhost', port: 3000, path: '/health', timeout: 3000 }; \
               const req = http.request(options, (res) => { \
                 process.exit(res.statusCode === 200 ? 0 : 1); \
               }); \
               req.on('error', () => process.exit(1)); \
               req.end();"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index-wapi-complete-optimized.js"]
