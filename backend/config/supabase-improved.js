const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

// Environment validation with detailed error messages
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', { missingVars });
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate URL format
const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
if (!urlPattern.test(requiredEnvVars.SUPABASE_URL)) {
  logger.error('Invalid SUPABASE_URL format', { url: requiredEnvVars.SUPABASE_URL });
  console.error('❌ Invalid SUPABASE_URL format. Expected format: https://your-project.supabase.co');
  process.exit(1);
}

// Validate service role key format (basic check)
if (!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
  logger.warn('Service role key format looks unusual', { 
    keyPrefix: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' 
  });
  console.warn('⚠️  Service role key format looks unusual. Please verify it\'s correct.');
}

/**
 * Supabase Client Configuration
 * Optimized for server-side operations with enhanced error handling
 */
const supabaseConfig = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'justhear-booking-system-server',
      'X-Server-Version': '2.0.0'
    }
  },
  // Connection pool settings for better performance
  db: {
    schema: 'public'
  },
  // Retry configuration for better reliability
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
};

// Create Supabase client with enhanced configuration
const supabase = createClient(
  requiredEnvVars.SUPABASE_URL, 
  requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY, 
  supabaseConfig
);

/**
 * Connection health check utility
 * @returns {Promise<Object>} Connection status
 */
async function checkConnection() {
  try {
    const startTime = Date.now();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { head: true, count: 'exact' })
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      logger.error('Database connection check failed', { 
        error: error.message, 
        responseTime: `${responseTime}ms` 
      });
      return {
        status: 'error',
        message: error.message,
        responseTime: `${responseTime}ms`
      };
    }
    
    logger.info('Database connection check successful', { responseTime: `${responseTime}ms` });
    return {
      status: 'connected',
      message: 'Database connection successful',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    logger.error('Database connection check exception', { error: error.message });
    return {
      status: 'error',
      message: error.message,
      responseTime: 'timeout'
    };
  }
}

/**
 * Initialize database connection with retry logic
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 */
async function initializeConnection(maxRetries = 3, retryDelay = 2000) {
  logger.info('Initializing Supabase connection', { maxRetries, retryDelay });
  console.log('🔌 Initializing Supabase connection...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connectionStatus = await checkConnection();
      
      if (connectionStatus.status === 'connected') {
        logger.info('Supabase connected successfully', { 
          attempt, 
          responseTime: connectionStatus.responseTime 
        });
        console.log(`✅ Supabase connected successfully (${connectionStatus.responseTime})`);
        return true;
      } else {
        throw new Error(connectionStatus.message);
      }
    } catch (error) {
      logger.error(`Connection attempt ${attempt}/${maxRetries} failed`, { 
        attempt, 
        maxRetries, 
        error: error.message 
      });
      console.error(`❌ Connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        logger.info(`Retrying in ${retryDelay}ms`, { attempt, retryDelay });
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        logger.error('Failed to establish database connection after all retries', { 
          maxRetries, 
          finalError: error.message 
        });
        console.error('🚨 Failed to establish database connection after all retries');
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
  }
}

/**
 * Enhanced query wrapper with automatic retry and logging
 * @param {Function} queryFn - Supabase query function
 * @param {string} operationName - Name of the operation for logging
 * @param {number} maxRetries - Maximum retry attempts for failed queries
 */
async function executeWithRetry(queryFn, operationName = 'unknown', maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const startTime = Date.now();
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${operationName} took ${duration}ms`, {
          operation: operationName,
          duration,
          threshold: 1000
        });
      }
      
      return result;
    } catch (error) {
      if (attempt <= maxRetries && isRetryableError(error)) {
        logger.warn(`Retrying ${operationName} (attempt ${attempt}/${maxRetries + 1})`, {
          operation: operationName,
          attempt,
          maxRetries: maxRetries + 1,
          error: error.message
        });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        logger.error(`${operationName} failed after ${attempt} attempts`, {
          operation: operationName,
          attempts: attempt,
          error: error.message
        });
        throw error;
      }
    }
  }
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} Whether the error is retryable
 */
function isRetryableError(error) {
  // Network errors, timeouts, and temporary database issues
  const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
  const retryableMessages = ['timeout', 'connection', 'network', 'temporary', 'rate limit'];
  
  return retryableCodes.includes(error.code) || 
         retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats() {
  try {
    const startTime = Date.now();
    
    // Get basic table counts
    const [usersCount, slotsCount, bookingsCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('time_slots').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
    ]);
    
    const responseTime = Date.now() - startTime;
    
    return {
      users: usersCount.count || 0,
      slots: slotsCount.count || 0,
      bookings: bookingsCount.count || 0,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get database stats', { error: error.message });
    throw error;
  }
}

/**
 * Test database performance
 * @returns {Promise<Object>} Performance test results
 */
async function testDatabasePerformance() {
  const tests = [];
  
  try {
    // Test 1: Simple select
    const start1 = Date.now();
    await supabase.from('users').select('id').limit(1);
    tests.push({
      name: 'Simple Select',
      duration: Date.now() - start1
    });
    
    // Test 2: Count query
    const start2 = Date.now();
    await supabase.from('time_slots').select('*', { count: 'exact', head: true });
    tests.push({
      name: 'Count Query',
      duration: Date.now() - start2
    });
    
    // Test 3: Join query
    const start3 = Date.now();
    await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(id, username)
      `)
      .limit(5);
    tests.push({
      name: 'Join Query',
      duration: Date.now() - start3
    });
    
    const totalTime = tests.reduce((sum, test) => sum + test.duration, 0);
    const averageTime = totalTime / tests.length;
    
    return {
      tests,
      totalTime,
      averageTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database performance test failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  supabase,
  checkConnection,
  initializeConnection,
  executeWithRetry,
  isRetryableError,
  getDatabaseStats,
  testDatabasePerformance
};
