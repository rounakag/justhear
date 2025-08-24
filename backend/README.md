# JustHear Backend API

A Node.js/Express backend API for the JustHear anonymous listening platform.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:5001/health
   ```

## 📋 API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/health` - API health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Time Slots
- `GET /api/slots` - Get all time slots
- `GET /api/slots/:id` - Get slot by ID

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## 🚀 Deployment to Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add backend API"
   git push origin main
   ```

2. **Ensure your repository structure:**
   ```
   backend/
   ├── server.js          # Main server file
   ├── package.json       # Dependencies and scripts
   ├── .env              # Environment variables (don't commit this)
   └── README.md         # This file
   ```

### Step 2: Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" and select "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**
   - **Name:** `justhear-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend` (if your backend is in a subdirectory)

5. **Add Environment Variables:**
   - `NODE_ENV=production`
   - `JWT_SECRET=your_production_jwt_secret`
   - `JWT_EXPIRES_IN=7d`
   - `CORS_ORIGIN=https://your-frontend-domain.com`

6. **Click "Create Web Service"**

### Step 3: Update Frontend Configuration

After deployment, update your frontend API configuration:

```typescript
// src/services/api.ts
const API_BASE_URL = 'https://your-backend-service.onrender.com/api';
```

## 🧪 Testing

### Manual Testing

Test the API endpoints using curl:

```bash
# Health check
curl https://your-backend-service.onrender.com/health

# Login
curl -X POST https://your-backend-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@justhear.com","password":"admin123"}'

# Get users
curl https://your-backend-service.onrender.com/api/users
```

### Automated Testing

```bash
npm test
```

## 📊 Monitoring

- **Health Check:** `/health` endpoint for monitoring
- **Logs:** Available in Render dashboard
- **Metrics:** Built-in Express logging

## 🔒 Security

- CORS enabled for frontend domain
- Helmet.js for security headers
- Rate limiting (to be implemented)
- Input validation with Joi
- JWT authentication

## 🗄️ Database

Currently using mock data. Future implementation will include:
- PostgreSQL for production
- SQLite for development
- Knex.js for database migrations

## 📝 License

MIT License - see LICENSE file for details.
