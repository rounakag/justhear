# Multi-stage build for optimized production deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies with optimizations
RUN npm ci --only=production --prefer-offline --no-audit --no-fund --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build:fast

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
