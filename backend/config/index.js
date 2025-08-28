// Centralized configuration management
const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://justhear.onrender.com'
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP'
  },
  cache: {
    ttl: 300, // 5 minutes
    checkperiod: 600 // 10 minutes
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validate required configuration
const requiredConfig = ['jwtSecret', 'supabase.url', 'supabase.serviceRoleKey'];
requiredConfig.forEach(key => {
  const value = key.includes('.') 
    ? key.split('.').reduce((obj, k) => obj?.[k], config)
    : config[key];
  
  if (!value) {
    throw new Error(`Required config ${key} is missing`);
  }
});

module.exports = config;
