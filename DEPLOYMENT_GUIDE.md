# 🚀 JustHear Platform - Production Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Database Setup](#database-setup)
4. [Frontend Setup](#frontend-setup)
5. [Meeting Integration](#meeting-integration)
6. [Payment Integration](#payment-integration)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher) - for caching and sessions
- **Git** (for version control)
- **PM2** (for process management)
- **Nginx** (for reverse proxy)

### Required Accounts & APIs
- **Stripe** account for payments
- **Zoom** Developer account for meetings
- **Google Cloud** account (optional, for Google Meet)
- **Microsoft Azure** account (optional, for Teams)
- **Twilio** account for SMS (optional)
- **Email service** (Gmail, SendGrid, etc.)

## 🗄️ Backend Setup

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/rounakag/justhear.git
cd justhear/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file with your production values:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=justhear_user
DB_PASSWORD=secure_password
DB_NAME=justhear_prod

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Payment Configuration (Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Meeting Providers
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
```

### 3. Database Setup
```bash
# Create database
createdb justhear_prod

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 4. Start Backend Server
```bash
# Development
npm run dev

# Production
npm start

# Using PM2
pm2 start src/server.js --name "justhear-backend"
pm2 save
pm2 startup
```

## 🗄️ Database Setup

### PostgreSQL Configuration
```sql
-- Create database user
CREATE USER justhear_user WITH PASSWORD 'secure_password';
CREATE DATABASE justhear_prod OWNER justhear_user;
GRANT ALL PRIVILEGES ON DATABASE justhear_prod TO justhear_user;

-- Enable required extensions
\c justhear_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Database Migrations
```bash
# Run all migrations
npm run migrate

# Create new migration
npx knex migrate:make migration_name

# Rollback migration
npx knex migrate:rollback
```

## 🎨 Frontend Setup

### 1. Update API Configuration
Edit `src/config/environment.ts`:

```typescript
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com' 
    : 'http://localhost:5000',
  stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  // ... other config
};
```

### 2. Build for Production
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run preview
```

### 3. Deploy Frontend
```bash
# Using PM2 for SPA
pm2 start npm --name "justhear-frontend" -- run preview

# Or serve static files with Nginx
sudo cp -r dist/* /var/www/justhear/
```

## 🎥 Meeting Integration

### Zoom Setup
1. **Create Zoom App**:
   - Go to [Zoom Marketplace](https://marketplace.zoom.us/)
   - Create a "Meeting SDK" app
   - Get API Key and Secret

2. **Configure Webhook** (optional):
   - Set webhook URL: `https://api.yourdomain.com/webhooks/zoom`
   - Subscribe to events: `meeting.started`, `meeting.ended`

### Google Meet Setup
1. **Enable Google Calendar API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Calendar API
   - Create OAuth 2.0 credentials

### Microsoft Teams Setup
1. **Register Azure App**:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Register new application
   - Get Client ID and Secret

## 💳 Payment Integration

### Stripe Setup
1. **Create Stripe Account**:
   - Sign up at [Stripe](https://stripe.com/)
   - Get API keys from Dashboard

2. **Configure Webhooks**:
   - Add webhook endpoint: `https://api.yourdomain.com/webhooks/stripe`
   - Subscribe to events: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Test Payments**:
   ```bash
   # Test card numbers
   4242 4242 4242 4242 # Success
   4000 0000 0000 0002 # Declined
   ```

## 🚀 Production Deployment

### Using Docker (Recommended)

#### 1. Create Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### 2. Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: justhear_prod
      POSTGRES_USER: justhear_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Cloud Platforms

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create justhear-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...

# Deploy
git push heroku main
```

#### AWS Deployment
```bash
# Using AWS Elastic Beanstalk
eb init justhear-app
eb create production
eb deploy
```

#### DigitalOcean Deployment
```bash
# Using DigitalOcean App Platform
# Upload code and configure environment variables
# Set build command: npm run build
# Set run command: npm start
```

## 🔒 Security Configuration

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/justhear
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/justhear;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health check
curl https://api.yourdomain.com/health

# Database connection
npm run db:check

# SSL certificate status
certbot certificates
```

### Logs & Monitoring
```bash
# View application logs
pm2 logs justhear-backend

# Monitor system resources
pm2 monit

# Database monitoring
pg_stat_statements
```

### Backup Strategy
```bash
# Database backup
pg_dump justhear_prod > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump justhear_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Performance Optimization
```bash
# Enable database query caching
# Configure Redis for session storage
# Enable CDN for static assets
# Implement rate limiting
# Set up monitoring alerts
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
          
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
          
      - name: Build frontend
        run: cd frontend && npm run build
        
      - name: Deploy to server
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection Errors**:
   - Check PostgreSQL service status
   - Verify connection credentials
   - Check firewall settings

2. **Meeting Link Generation Fails**:
   - Verify Zoom API credentials
   - Check API rate limits
   - Validate webhook endpoints

3. **Payment Processing Issues**:
   - Verify Stripe API keys
   - Check webhook configuration
   - Validate payment intent creation

4. **Frontend Build Errors**:
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify environment variables

### Support Resources
- [JustHear Documentation](https://docs.justhear.com)
- [Stripe Documentation](https://stripe.com/docs)
- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📞 Support

For deployment assistance or technical support:
- **Email**: support@justhear.com
- **Documentation**: https://docs.justhear.com
- **GitHub Issues**: https://github.com/rounakag/justhear/issues

---

**🎯 Next Steps:**
1. Set up your production environment
2. Configure all third-party integrations
3. Test the complete system
4. Deploy to production
5. Set up monitoring and alerts
6. Train your team on the platform

**Good luck with your JustHear deployment! 🚀**
